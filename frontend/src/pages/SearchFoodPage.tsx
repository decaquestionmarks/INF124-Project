import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import SearchIcon from '@mui/icons-material/Search'
import { SecondaryHeader } from '../components/Header.tsx'
import './SearchFoodPage.css'
import { useLocation, useNavigate } from 'react-router-dom'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle'
import { toast } from 'react-hot-toast'
import { authFetch } from '../api.ts'

type SearchFoodProps = {
  linkBack: string
}

type FoodSource = 'global'

type Macronutrients = {
  calories: number
  fat: number
  protein: number
  carbs: number
}

type FoodResult = {
  id?: string
  name: string
  classification: string
  measurementClassification: string
  measurement: number
  macronutrients: Macronutrients
  source?: FoodSource
}

type FoodCreatorForm = {
  name: string
  classification: string
  measurementClassification: 'grams' | 'ml'
  measurement: string
  calories: string
  carbs: string
  fat: string
  protein: string
}

const FOOD_CLASSIFICATIONS = ['Meat', 'Produce', 'Bakery', 'Dairy', 'Pantry', 'Frozen', 'Drinks', 'Snacks', 'Condiments', 'Spices and Baking', 'Other']
const MEASUREMENT_OPTIONS: Array<FoodCreatorForm['measurementClassification']> = ['grams', 'ml']
const DEFAULT_FOOD_LIMIT = 10

const defaultCreatorForm = (): FoodCreatorForm => ({
  name: '',
  classification: 'Other',
  measurementClassification: 'grams',
  measurement: '100',
  calories: '',
  carbs: '',
  fat: '',
  protein: '',
})

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

const toNumber = (value: unknown, fallback = 0) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : fallback
}

const roundNutrient = (value: number) => Number(value.toFixed(1))

const scaleMacros = (macronutrients: Macronutrients, servings: number): Macronutrients => ({
  calories: roundNutrient(toNumber(macronutrients.calories) * servings),
  carbs: roundNutrient(toNumber(macronutrients.carbs) * servings),
  fat: roundNutrient(toNumber(macronutrients.fat) * servings),
  protein: roundNutrient(toNumber(macronutrients.protein) * servings),
})

const formatAmount = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1)

const getFoodKey = (food: FoodResult) => `${food.source ?? 'global'}-${food.id ?? food.name}-${food.measurement}-${food.measurementClassification}`

const normalizeFoodResult = (food: Partial<FoodResult>, source: FoodSource): FoodResult | null => {
  if (!food.name || !food.measurementClassification) {
    return null
  }

  const measurement = toNumber(food.measurement)

  if (measurement <= 0) {
    return null
  }

  const macronutrients = food.macronutrients ?? { calories: 0, carbs: 0, fat: 0, protein: 0 }

  return {
    id: food.id,
    name: food.name,
    classification: food.classification || 'Other',
    measurementClassification: normalizeMeasurementLabel(food.measurementClassification),
    measurement,
    macronutrients: {
      calories: toNumber(macronutrients.calories),
      carbs: toNumber(macronutrients.carbs),
      fat: toNumber(macronutrients.fat),
      protein: toNumber(macronutrients.protein),
    },
    source,
  }
}

export function SearchFoodPage({ linkBack }: SearchFoodProps) {
  const [searchResults, setSearchResults] = useState<FoodResult[]>([])
  const [defaultFoods, setDefaultFoods] = useState<FoodResult[]>([])
  const [addedItem, setAddedItem] = useState<FoodResult | null>(null)
  const [userInput, setUserInput] = useState('')
  const userInputRef = useRef('')
  const [servingCount, setServingCount] = useState('1')
  const [creatorForm, setCreatorForm] = useState<FoodCreatorForm>(() => defaultCreatorForm())
  const [isSavingFood, setIsSavingFood] = useState(false)
  const [isCreatorOpen, setIsCreatorOpen] = useState(false)
  const [isLoadingDefaultFoods, setIsLoadingDefaultFoods] = useState(false)
  const navigate = useNavigate()

  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const meal = params.get('meal')
  const date = params.get('date')
  const memberId = params.get('memberId') ?? 'self'

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > 900
  })

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

  const fetchDefaultFoods = async () => {
    const res = await authFetch('/foods')
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Unable to load foods')
    }

    return Array.isArray(data.results)
      ? data.results
        .map((food: Partial<FoodResult>) => normalizeFoodResult(food, 'global'))
        .filter(Boolean)
        .slice(0, DEFAULT_FOOD_LIMIT) as FoodResult[]
      : []
  }

  const fetchGlobalFoods = async (query: string) => {
    if (!query) return []

    const res = await authFetch(`/foods/search?query=${encodeURIComponent(query)}`)
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || 'Unable to search foods')
    }

    return Array.isArray(data.results)
      ? data.results.map((food: Partial<FoodResult>) => normalizeFoodResult(food, 'global')).filter(Boolean) as FoodResult[]
      : []
  }

  const searchFoods = async (query = userInput.trim()) => {
    if (!query) {
      setSearchResults(defaultFoods)
      return
    }

    try {
      const globalFoods = await fetchGlobalFoods(query)
      setSearchResults(globalFoods)
    } catch (error) {
      console.error('Error searching for foods: ', error)
      toast.error('Unable to search foods. Please try again.')
    }
  }

  const handleSubmitSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    await searchFoods(userInput.trim())
  }

  useEffect(() => {
    let isActive = true

    const loadDefaultFoods = async () => {
      try {
        setIsLoadingDefaultFoods(true)
        const foods = await fetchDefaultFoods()
        if (!isActive) return

        setDefaultFoods(foods)
        setSearchResults((currentResults) => currentResults.length > 0 || userInputRef.current.trim() ? currentResults : foods)
      } catch (error) {
        console.error('Error loading default foods: ', error)
        if (isActive) {
          toast.error('Unable to load foods. Please try again.')
        }
      } finally {
        if (isActive) {
          setIsLoadingDefaultFoods(false)
        }
      }
    }

    loadDefaultFoods()

    return () => {
      isActive = false
    }
  }, [])

  const updateCreatorField = (field: keyof FoodCreatorForm, value: string) => {
    setCreatorForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }))
  }

  const handleSaveFood = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const measurement = toNumber(creatorForm.measurement)

    if (!creatorForm.name.trim()) {
      toast.error('Enter a food name before saving.')
      return
    }

    if (measurement <= 0) {
      toast.error('Enter a serving size greater than 0.')
      return
    }

    try {
      setIsSavingFood(true)
      const res = await authFetch('/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: creatorForm.name.trim(),
          classification: creatorForm.classification,
          measurementClassification: creatorForm.measurementClassification,
          measurement,
          macronutrients: {
            calories: toNumber(creatorForm.calories),
            carbs: toNumber(creatorForm.carbs),
            fat: toNumber(creatorForm.fat),
            protein: toNumber(creatorForm.protein),
          },
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Unable to save food')
      }

      const newFood = normalizeFoodResult(data, 'global')

      if (newFood) {
        setAddedItem(newFood)
        setServingCount('1')
        setSearchResults((prev) => {
          const hasExisting = prev.some((food) => food.name.trim().toLowerCase() === newFood.name.trim().toLowerCase())
          if (hasExisting) {
            return prev.map((food) => food.name.trim().toLowerCase() === newFood.name.trim().toLowerCase() ? newFood : food)
          }
          return [newFood, ...prev]
        })
      }

      setCreatorForm(defaultCreatorForm())
      toast.success(`${newFood?.name ?? 'Food'} saved to foods`) 
    } catch (error) {
      console.error('Error saving food: ', error)
      toast.error('Failed to save food. Please try again.')
    } finally {
      setIsSavingFood(false)
    }
  }

  const servings = toNumber(servingCount)
  const hasValidServingCount = Number.isFinite(servings) && servings > 0
  const selectedMeasurement = addedItem && hasValidServingCount ? roundNutrient(addedItem.measurement * servings) : 0
  const selectedMacros = useMemo(() => {
    return addedItem && hasValidServingCount
      ? scaleMacros(addedItem.macronutrients, servings)
      : { calories: 0, carbs: 0, fat: 0, protein: 0 }
  }, [addedItem, hasValidServingCount, servings])

  const handleLogFood = async () => {
    if (!addedItem) {
      toast.error('Choose a food before logging.')
      return
    }

    if (!hasValidServingCount) {
      toast.error('Enter a valid number of servings.')
      return
    }

    const payload = {
      name: addedItem.name,
      classification: addedItem.classification,
      measurementClassification: addedItem.measurementClassification,
      measurement: selectedMeasurement,
      servings: roundNutrient(servings),
      servingMeasurement: addedItem.measurement,
      servingMeasurementClassification: addedItem.measurementClassification,
      macronutrients: selectedMacros,
    }

    if (linkBack === '/fridge') {
      try {
        const res = await authFetch('/users/me/fridge', {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          throw new Error('Failed to add food to fridge')
        }

        toast.success(`Added ${addedItem.name} to fridge`)
        navigate(linkBack, { state: { meal, date, memberId, addedItem } })
      } catch (error) {
        console.error('Error adding food to fridge: ', error)
        toast.error('Failed to add food to fridge. Please try again')
      }
    } else if (linkBack === '/calorie-tracking') {
      try {
        const goalDate = date ?? new Date().toISOString().slice(0, 10)
        const res = await authFetch(`/users/me/goal/${goalDate}/foods`, {
          method: 'POST',
          headers: { 'Content-type': 'application/json' },
          body: JSON.stringify({
            memberId,
            ...payload,
          }),
        })
        if (!res.ok) {
          throw new Error('Failed to log food to calorie tracker')
        }
        toast.success(`Logged ${addedItem.name} to calorie tracker`)
        navigate(linkBack, { state: { meal, date, memberId, addedItem } })
      } catch (error) {
        console.error('Error logging food to calorie tracker: ', error)
        toast.error('Failed to log food. Please try again')
      }
    }
  }

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
        <SecondaryHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} pageTitle="Food Finder" linkBack={linkBack}></SecondaryHeader>

        <section className="food-finder-page">
          <section className="food-finder-search">
            <form onSubmit={handleSubmitSearch} className="search-form">
              <SearchIcon aria-hidden="true" className="search-icon"></SearchIcon>
              <input
                id="search-bar-input"
                value={userInput}
                onChange={(event) => {
                  const value = event.target.value
                  userInputRef.current = value
                  setUserInput(value)
                  if (!value.trim()) {
                    setSearchResults(defaultFoods)
                  }
                }}
                aria-label="Search Foods"
                type="search"
                placeholder="Search Foods"
                className="search-bar"
                autoComplete="off"
              />
            </form>
          </section>

          <section className="search-results" aria-label="Food results">
            {isLoadingDefaultFoods && searchResults.length === 0 ? (
              <p className="search-results-message">Loading foods...</p>
            ) : null}

            {!isLoadingDefaultFoods && searchResults.length === 0 ? (
              <p className="search-results-message">No foods found.</p>
            ) : null}

            {searchResults.map((result) => (
              <div onClick={() => { setAddedItem(result); setServingCount('1') }} key={getFoodKey(result)} className="search-item">
                <div className={`search-item-heading ${addedItem && getFoodKey(addedItem) === getFoodKey(result) ? 'added' : ''}`}>
                  <span className="search-item-name">{result.name}</span>
                  <div className="amount-and-unit">
                    <span>{formatAmount(result.measurement)}</span>
                    <span>{result.measurementClassification}</span>
                  </div>
                  <span className="search-item-calories">{formatAmount(result.macronutrients.calories)} cal</span>
                  <button
                    aria-label="Select item"
                    className="add-icon"
                    id="add-item-button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setAddedItem(result)
                      setServingCount('1')
                    }}
                    type="button"
                  >
                    {addedItem && getFoodKey(addedItem) === getFoodKey(result)
                      ? <RemoveCircleIcon aria-hidden="true" fontSize="medium" />
                      : <AddCircleIcon aria-hidden="true" fontSize="medium" />}
                  </button>
                </div>
              </div>
            ))}
          </section>

          {addedItem !== null &&
            <section className="selected-food-panel">
              <div className="selected-food-header">
                <span>Selected</span>
                <strong>{addedItem.name}</strong>
              </div>
              <div className="selected-food-macros">
                {[
                  ['Calories', formatAmount(selectedMacros.calories)],
                  ['Carbs', `${formatAmount(selectedMacros.carbs)}g`],
                  ['Fat', `${formatAmount(selectedMacros.fat)}g`],
                  ['Protein', `${formatAmount(selectedMacros.protein)}g`],
                ].map(([label, value]) => (
                  <div className="selected-food-macro" key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="serving-inputs">
                <label htmlFor="serving-count">Servings</label>
                <input
                  className="serving-size"
                  name="serving-count"
                  id="serving-count"
                  type="number"
                  value={servingCount}
                  min="0.1"
                  step="0.1"
                  onChange={(event) => {
                    const value = event.target.value
                    if (value === '' || Number(value) >= 0) {
                      setServingCount(value)
                    }
                  }}
                />
                <span>{formatAmount(selectedMeasurement)} {addedItem.measurementClassification}</span>
              </div>
              <div className="save-bar">
                <button onClick={handleLogFood} className="save-button" disabled={!hasValidServingCount} type="button">Log</button>
              </div>
            </section>}

          <div className="custom-food-creator-cta">
            <button
              type="button"
              className="save-button"
              onClick={() => setIsCreatorOpen((open) => !open)}
            >
              {isCreatorOpen ? (
                <RemoveCircleIcon aria-hidden="true" fontSize="small" />
              ) : (
                <AddCircleIcon aria-hidden="true" fontSize="small" />
              )}
              {isCreatorOpen ? 'Hide custom food creator' : 'Create custom food'}
            </button>
          </div>

          {isCreatorOpen && (
            <form onSubmit={handleSaveFood} className="food-creator">
              <h2>Create Food</h2>
              <div className="food-creator-grid">
                <label>
                  <span>Name</span>
                  <input value={creatorForm.name} onChange={(event) => updateCreatorField('name', event.target.value)} autoComplete="off" />
                </label>
                <label>
                  <span>Category</span>
                  <select value={creatorForm.classification} onChange={(event) => updateCreatorField('classification', event.target.value)}>
                    {FOOD_CLASSIFICATIONS.map((classification) => (
                      <option key={classification} value={classification}>{classification}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Serving Size</span>
                  <input type="number" min="0.1" step="0.1" value={creatorForm.measurement} onChange={(event) => updateCreatorField('measurement', event.target.value)} />
                </label>
                <label>
                  <span>Unit</span>
                  <select value={creatorForm.measurementClassification} onChange={(event) => updateCreatorField('measurementClassification', event.target.value as FoodCreatorForm['measurementClassification'])}>
                    {MEASUREMENT_OPTIONS.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Calories</span>
                  <input type="number" min="0" step="0.1" value={creatorForm.calories} onChange={(event) => updateCreatorField('calories', event.target.value)} />
                </label>
                <label>
                  <span>Carbs</span>
                  <input type="number" min="0" step="0.1" value={creatorForm.carbs} onChange={(event) => updateCreatorField('carbs', event.target.value)} />
                </label>
                <label>
                  <span>Fat</span>
                  <input type="number" min="0" step="0.1" value={creatorForm.fat} onChange={(event) => updateCreatorField('fat', event.target.value)} />
                </label>
                <label>
                  <span>Protein</span>
                  <input type="number" min="0" step="0.1" value={creatorForm.protein} onChange={(event) => updateCreatorField('protein', event.target.value)} />
                </label>
              </div>
              <div className="save-bar">
                <button type="submit" className="save-button" disabled={isSavingFood}>
                  <AddCircleIcon aria-hidden="true" fontSize="small" />
                  Save Food
                </button>
              </div>
            </form>
          )}
        </section>
      </section>
    </main>
  )
}

export default SearchFoodPage
