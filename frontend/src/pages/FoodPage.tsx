import { useEffect, useState } from 'react'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './FoodPage.css'
import { SecondaryHeader } from '../components/Header.tsx'
import { useLocation } from 'react-router-dom'
import { authFetch } from '../api.ts'

type TrackedFood = {
  id: string;
  name: string;
  measurement: number;
  measurementClassification: string;
  servings?: number;
  servingMeasurement?: number;
  servingMeasurementClassification?: string;
  macronutrients?: {
    calories?: number;
    fat?: number;
    protein?: number;
    carbs?: number;
  };
}

type MacroKey = 'protein' | 'carbs' | 'fat'

type MacroVisualizerItem = {
  key: MacroKey;
  label: string;
  caloriesPerGram: number;
}

type MacroVisualizerSegment = MacroVisualizerItem & {
  grams: number;
  macroCalories: number;
  percent: number;
}

type FoodDetailRow = {
  label: string;
  value: string;
  highlight?: boolean;
}

const MACRO_VISUALIZER_ITEMS: MacroVisualizerItem[] = [
  { key: 'protein', label: 'Protein', caloriesPerGram: 4 },
  { key: 'carbs', label: 'Net Carbs', caloriesPerGram: 4 },
  { key: 'fat', label: 'Fat', caloriesPerGram: 9 },
]

const DONUT_SEGMENT_ORDER: MacroKey[] = ['fat', 'protein', 'carbs']
const DONUT_RADIUS = 58
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS

const toNumber = (value: unknown) => {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

const normalizeMeasurementLabel = (value: string) => {
  const normalized = value.trim().toLowerCase()

  if (normalized === 'mass' || normalized === 'gram' || normalized === 'grams' || normalized === 'g') {
    return 'grams'
  }

  if (normalized === 'volume' || normalized === 'milliliter' || normalized === 'milliliters' || normalized === 'ml') {
    return 'ml'
  }

  return value
}

const formatAmount = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1)

const formatGrams = (value: number) => `${value.toFixed(1)}g`

const getMacroVisualizerData = (macros: TrackedFood['macronutrients']) => {
  const segments = MACRO_VISUALIZER_ITEMS.map((item) => {
    const grams = toNumber(macros?.[item.key])

    return {
      ...item,
      grams,
      macroCalories: grams * item.caloriesPerGram,
      percent: 0,
    }
  })

  const totalMacroCalories = segments.reduce((sum, segment) => sum + segment.macroCalories, 0)
  const displayCalories = toNumber(macros?.calories)

  return {
    calories: Math.round(displayCalories > 0 ? displayCalories : totalMacroCalories),
    labels: segments.map((segment) => ({
      ...segment,
      percent: totalMacroCalories > 0 ? (segment.macroCalories / totalMacroCalories) * 100 : 0,
    })),
  }
}

function MacroDonut({ segments }: { segments: MacroVisualizerSegment[] }) {
  const visibleSegments = DONUT_SEGMENT_ORDER
    .map((key) => segments.find((segment) => segment.key === key))
    .filter((segment): segment is MacroVisualizerSegment => segment !== undefined && segment.percent > 0)

  const gapLength = visibleSegments.length > 1 ? 4 : 0
  const drawableSegments = visibleSegments.reduce<{
    offset: number;
    segments: Array<MacroVisualizerSegment & {
      dashLength: number;
      dashOffset: number;
    }>;
  }>((accumulator, segment) => {
    const segmentLength = (segment.percent / 100) * DONUT_CIRCUMFERENCE
    const dashLength = Math.max(segmentLength - gapLength, 0)

    return {
      offset: accumulator.offset + segmentLength,
      segments: [
        ...accumulator.segments,
        {
          ...segment,
          dashLength,
          dashOffset: -accumulator.offset,
        },
      ],
    }
  }, { offset: 0, segments: [] }).segments

  return (
    <svg className="macro-donut" viewBox="0 0 140 140" aria-hidden="true">
      <circle
        className="macro-donut__track"
        cx="70"
        cy="70"
        r={DONUT_RADIUS}
        fill="none"
        strokeWidth="11"
      />
      {drawableSegments.map((segment) => (
          <circle
            className={`macro-donut__segment macro-donut__segment--${segment.key}`}
            key={segment.key}
            cx="70"
            cy="70"
            r={DONUT_RADIUS}
            fill="none"
            strokeWidth="11"
            strokeDasharray={`${segment.dashLength} ${DONUT_CIRCUMFERENCE - segment.dashLength}`}
            strokeDashoffset={segment.dashOffset}
          />
      ))}
    </svg>
  )
}

const getFoodAmountLabel = (food: TrackedFood) => {
  const measurement = Number(food.measurement)
  const measurementClassification = normalizeMeasurementLabel(food.measurementClassification)
  const servingMeasurement = Number(food.servingMeasurement)
  const explicitServings = Number(food.servings)
  const servings = Number.isFinite(explicitServings) && explicitServings > 0
    ? explicitServings
    : servingMeasurement > 0 && measurement > 0 ? measurement / servingMeasurement : 0

  if (servingMeasurement > 0 && servings > 0) {
    const servingLabel = servings === 1 ? 'serving' : 'servings'
    return `${formatAmount(servings)} ${servingLabel} (${formatAmount(measurement)} ${measurementClassification})`
  }

  return `${formatAmount(measurement)} ${measurementClassification}`
}

export function FoodPage(){
  const location = useLocation();
  const params = new URLSearchParams(location.search)
  const trackedFoodId = params.get('trackedFoodId')
  const foodName = params.get('trackedFoodName')
  const selectedDate = params.get('date') ?? new Date().toISOString().slice(0, 10)
  const memberId = params.get('memberId') ?? 'self'
  const [trackedFood, setTrackedFood] = useState<TrackedFood | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > 900
  })

  useEffect(() => {
    if (!trackedFoodId && !foodName) {
      const timer = window.setTimeout(() => {
        setTrackedFood(null)
        setError("No tracked food selected.")
        setIsLoading(false)
      }, 0)

      return () => window.clearTimeout(timer)
    }

    const handleFetchFoodDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const res = await authFetch(`/users/me/goal/foods?date=${selectedDate}&memberId=${encodeURIComponent(memberId)}`)
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Unable to load tracked food.")
        }

        const foods = Array.isArray(data.foods) ? data.foods as TrackedFood[] : []
        const selectedFood = foods.find((food) => {
          if (trackedFoodId) {
            return food.id === trackedFoodId
          }

          return foodName ? food.name.toLowerCase() === foodName.toLowerCase() : false
        })
        setTrackedFood(selectedFood ?? null)

        if (!selectedFood) {
          setError("Food not found for this date.")
        }
      } catch (err) {
        console.error("Error loading tracked food: ", err)
        setTrackedFood(null)
        setError("Unable to load tracked food.")
      } finally {
        setIsLoading(false)
      }
    }
    handleFetchFoodDetails()
  }, [trackedFoodId, foodName, selectedDate, memberId])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 900px)')
    const legacyMediaQuery = mediaQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void
    }

    const syncSidebarState = () => {
      setIsSidebarOpen(!mediaQuery.matches)
    }

    syncSidebarState()

    if ('addEventListener' in mediaQuery) {
      mediaQuery.addEventListener('change', syncSidebarState)

      return () => mediaQuery.removeEventListener('change', syncSidebarState)
    }

    legacyMediaQuery.addListener?.(syncSidebarState)

    return () => legacyMediaQuery.removeListener?.(syncSidebarState)
  }, [])

  const macros = trackedFood?.macronutrients ?? {}
  const macroVisualizer = getMacroVisualizerData(macros)
  const macroVisualizerLabel = macroVisualizer.labels
    .map((segment) => `${segment.label} ${Math.round(segment.percent)} percent, ${formatGrams(segment.grams)}`)
    .join('; ')
  const foodDetailRows: FoodDetailRow[] = trackedFood ? [
    { label: 'Amount', value: getFoodAmountLabel(trackedFood), highlight: true },
    { label: 'Calories', value: `${toNumber(macros.calories)} kcal`, highlight: true },
    { label: 'Protein', value: formatGrams(toNumber(macros.protein)) },
    { label: 'Carbs', value: formatGrams(toNumber(macros.carbs)) },
    { label: 'Fat', value: formatGrams(toNumber(macros.fat)) },
  ] : []
  
    return (
       <main
         className={`dashboard-page${isSidebarOpen ? ' dashboard-page--sidebar-open' : ' dashboard-page--sidebar-closed'}`}
       >
         <Sidebar
           isOpen={isSidebarOpen}
           onToggle={() => setIsSidebarOpen((open) => !open)}
         />
   
         <div
           className={`dashboard-page__backdrop${isSidebarOpen ? ' dashboard-page__backdrop--visible' : ''}`}
           aria-hidden="true"
           onClick={() => setIsSidebarOpen(false)}
         />
   
         <section className="dashboard-page__content">
            <SecondaryHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} pageTitle={trackedFood?.name ?? foodName ?? "Food Details"} linkBack="/calorie-tracking"></SecondaryHeader>
            <section className="food-page">

                {isLoading ? <p className="food-page__state">Loading food details...</p> : null}
                {!isLoading && error ? <p className="food-page__state food-page__state--error">{error}</p> : null}
                {!isLoading && trackedFood ? (
                  <div className="overall-macros">
                    <div className="food-page__summary">
                      <div className="food-page__summary-item">
                        <span>Logged amount</span>
                        <strong>{getFoodAmountLabel(trackedFood)}</strong>
                      </div>
                      <div className="food-page__summary-item food-page__summary-item--accent">
                        <span>Total calories</span>
                        <strong>{macroVisualizer.calories} kcal</strong>
                      </div>
                    </div>

                    <div className="food-page__details-grid">
                      <div
                        className="macro-visualizer"
                        role="img"
                        aria-label={`${macroVisualizer.calories} kilocalories. ${macroVisualizerLabel}`}
                      >
                        <div className="macro-visualizer__chart">
                          <MacroDonut segments={macroVisualizer.labels} />
                          <div className="macro-visualizer__center">
                            <strong>{macroVisualizer.calories}</strong>
                            <span>kcal</span>
                          </div>
                        </div>

                        <div className="macro-visualizer__legend" aria-hidden="true">
                          {macroVisualizer.labels.map((segment) => (
                            <div className="macro-visualizer__legend-row" key={segment.key}>
                              <span className={`macro-visualizer__legend-label macro-visualizer__legend-label--${segment.key}`}>
                                {segment.label} ({Math.round(segment.percent)}%)
                              </span>
                              <strong>{formatGrams(segment.grams)}</strong>
                            </div>
                          ))}
                        </div>
                      </div>

                      <section className="food-page__nutrition" aria-labelledby="food-page-nutrition-title">
                        <div className="food-page__nutrition-header">
                          <span>Details</span>
                          <h2 id="food-page-nutrition-title">Nutrition</h2>
                        </div>
                        <div className="food-page__nutrition-list">
                          {foodDetailRows.map((row) => (
                            <div className={`food-page__nutrition-row${row.highlight ? ' food-page__nutrition-row--highlight' : ''}`} key={row.label}>
                              <span>{row.label}</span>
                              <strong>{row.value}</strong>
                            </div>
                          ))}
                        </div>
                      </section>
                    </div>
                  </div>
                ) : null}
            </section>
        </section>
       </main>
     )
   }
   
