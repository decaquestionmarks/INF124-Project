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
  macronutrients?: {
    calories?: number;
    fat?: number;
    protein?: number;
    carbs?: number;
  };
}

const toNumber = (value: unknown) => {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
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
      setTrackedFood(null)
      setError("No tracked food selected.")
      setIsLoading(false)
      return
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

                {isLoading ? <p>Loading food details...</p> : null}
                {!isLoading && error ? <p>{error}</p> : null}
                {!isLoading && trackedFood ? (
                  <div className="overall-macros">
                  <div className="macro-row">
                        <span>Amount:</span>
                         <span>{trackedFood.measurement} {trackedFood.measurementClassification}</span>
                    </div>
                    <div className="macro-row">
                        <span>Calories:</span>
                        <span>{toNumber(macros.calories)}</span>
                    </div>
   
                    <div className="macro-row">
                        <span>Fat:</span>
                        <span>{toNumber(macros.fat)} g</span>
                    </div>
                    <div className="macro-row">
                        <span>Protein:</span>
                        <span>{toNumber(macros.protein)} g</span>
                    </div>
                    <div className="macro-row">
                        <span>Carbs:</span>
                        <span>{toNumber(macros.carbs)} g</span>
                    </div>
                  </div>
                ) : null}
            </section>
        </section>
       </main>
     )
   }
   
