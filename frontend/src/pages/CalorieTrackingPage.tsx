import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './CalorieTrackingPage.css'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {Header} from '../components/Header.tsx'
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import ArrowLeftRoundedIcon from '@mui/icons-material/ArrowLeftRounded';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import {toast} from 'react-hot-toast'
import { authFetch, getGoalWebSocketUrl } from '../api.ts'
import { useAuth } from '../auth/AuthContext.tsx'
type MacroProgress = {
  calories: {
    goal: number,
    total: number,
    remaining: number
  };
  carbs: number;
  fat: number;
  protein: number
};

type TrackedFood = {
  id: string;
  name: string;
  amount: number | string;
  measurement: number;
  measurementClassification: string;
  servings?: number;
  servingMeasurement?: number;
  servingMeasurementClassification?: string;
  macronutrients: {
    calories?: number;
    carbs?: number;
    fat?: number;
    protein?: number;
  };
};

type FamilyMember = {
  id: string;
  name: string;
  isDefault?: boolean;
};

type ProgressNutrient = {
  goal?: number;
  total?: number;
  remaining?: number;
};

type GoalUpdatePayload = {
  date?: string;
  memberId?: string;
  foods?: TrackedFood[];
  progress?: unknown;
};

type GoalWebSocketMessage = {
  type?: string;
  payload?: GoalUpdatePayload;
};

const emptyMacroProgress = (): MacroProgress => ({
  calories: {
    goal: 0,
    total: 0,
    remaining: 0,
  },
  carbs: 0,
  fat: 0,
  protein: 0,
})

const toNumber = (value: unknown) => {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

const readProgressNutrient = (progress: unknown, nutrient: string): ProgressNutrient => {
  if (!progress || typeof progress !== 'object') {
    return {}
  }

  const progressRecord = progress as Record<string, ProgressNutrient | undefined>
  return progressRecord[nutrient] ?? (nutrient === 'fat' ? progressRecord.fats : undefined) ?? {}
}

const toMacroProgress = (progress: unknown): MacroProgress => {
  const calories = readProgressNutrient(progress, 'calories')
  const carbs = readProgressNutrient(progress, 'carbs')
  const fat = readProgressNutrient(progress, 'fat')
  const protein = readProgressNutrient(progress, 'protein')

  return {
    calories: {
      goal: toNumber(calories.goal),
      total: toNumber(calories.total),
      remaining: toNumber(calories.remaining),
    },
    carbs: toNumber(carbs.total),
    fat: toNumber(fat.total),
    protein: toNumber(protein.total),
  }
}

const roundNutrient = (value: number) => Number(value.toFixed(1))

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

const formatStatValue = (value: number) => formatAmount(roundNutrient(value))

const getServingMeasurement = (food: TrackedFood) => Number(food.servingMeasurement)

const hasServingMetadata = (food: TrackedFood) => {
  const servingMeasurement = getServingMeasurement(food)
  return Number.isFinite(servingMeasurement) && servingMeasurement > 0
}

const getServingCount = (food: TrackedFood) => {
  const explicitServings = Number(food.servings)
  if (Number.isFinite(explicitServings) && explicitServings > 0) {
    return explicitServings
  }

  const servingMeasurement = getServingMeasurement(food)
  const measurement = Number(food.measurement)
  return servingMeasurement > 0 && measurement > 0 ? measurement / servingMeasurement : 0
}

const getEditableAmount = (food: TrackedFood) => {
  return hasServingMetadata(food) ? getServingCount(food) : Number(food.measurement)
}

const getEditUnit = (food: TrackedFood) => hasServingMetadata(food) ? 'servings' : normalizeMeasurementLabel(food.measurementClassification)

const formatTrackedFoodAmount = (food: TrackedFood) => {
  const measurement = Number(food.measurement)
  const measurementClassification = normalizeMeasurementLabel(food.measurementClassification)

  if (hasServingMetadata(food)) {
    const servings = getServingCount(food)
    const servingLabel = servings === 1 ? 'serving' : 'servings'
    return `${formatAmount(servings)} ${servingLabel} (${formatAmount(measurement)} ${measurementClassification})`
  }

  return `${formatAmount(measurement)} ${measurementClassification}`
}

const scaleMacronutrients = (macronutrients: TrackedFood['macronutrients'], ratio: number) => ({
  calories: roundNutrient(toNumber(macronutrients.calories) * ratio),
  carbs: roundNutrient(toNumber(macronutrients.carbs) * ratio),
  fat: roundNutrient(toNumber(macronutrients.fat) * ratio),
  protein: roundNutrient(toNumber(macronutrients.protein) * ratio),
})

const DEFAULT_MEMBER_ID = 'self'
const defaultFamilyMembers: FamilyMember[] = [{ id: DEFAULT_MEMBER_ID, name: 'Me', isDefault: true }]
const MEMBER_STORAGE_KEY = 'calorie-tracker-member-id'

export function CalorieTrackingPage(){
  const [editingFoodId, setEditingFoodId] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const current = new Date();
  const [date, setDate] = useState(current)
  const dateKey = date.toISOString().slice(0,10)
  const [foods, setFoods] = useState<TrackedFood[]>([])
  const [goalProgress, setGoalProgress] = useState<MacroProgress>(() => emptyMacroProgress())
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(defaultFamilyMembers)
  const [activeMemberId, setActiveMemberId] = useState(() => {
    if (typeof window === 'undefined') {
      return DEFAULT_MEMBER_ID
    }

    return window.localStorage.getItem(MEMBER_STORAGE_KEY) || DEFAULT_MEMBER_ID
  })
  const navigate = useNavigate()
  const { user } = useAuth()
  const memberQuery = `memberId=${encodeURIComponent(activeMemberId)}`
  const activeMember = familyMembers.find((member) => member.id === activeMemberId) ?? familyMembers[0]

  const handleSelectFood = (food: TrackedFood) => {
      navigate(`/calorie-tracking/food?trackedFoodId=${encodeURIComponent(food.id)}&date=${dateKey}&${memberQuery}`)
  }

  const decrementDate = () => {
    const d = new Date(date);
    d.setDate((d.getDate() - 1));
    setDate(d);
  }

  const incrementDate = () => {
    const d = new Date(date);
    d.setDate((d.getDate() + 1));
    setDate(d);
  }

 const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > 900
  })

  const handleDeleteFood = async (food: TrackedFood) => {
    // make API call to delete food
    try {
      const res = await authFetch(`/users/me/goal/${dateKey}/${encodeURIComponent(food.id)}?${memberQuery}`, {
        method: 'DELETE',
        headers :{
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok){
        throw new Error("Failed to delete food item")
      }
      const data = await res.json()
      const foods = data.foods
      setGoalProgress(toMacroProgress(data.progress))
      setFoods(Array.isArray(foods) ? foods : [])
      toast.success(`Deleted ${food.name}`)
    }
      catch (error) {
        console.error("Error deleting food item: ", error)
        toast.error("Failed to delete food item. Please try again")
      }
  }

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

  useEffect(() => {
    let isDisposed = false

    const fetchFamilyMembers = async () => {
      try {
        const res = await authFetch('/users/me/family')
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Unable to load family members")
        }

        if (isDisposed) return

        const members = Array.isArray(data.members) && data.members.length > 0
          ? data.members as FamilyMember[]
          : defaultFamilyMembers

        setFamilyMembers(members)
        setActiveMemberId((currentMemberId) => {
          if (members.some((member) => member.id === currentMemberId)) {
            return currentMemberId
          }

          return members.find((member) => member.isDefault)?.id || members[0]?.id || DEFAULT_MEMBER_ID
        })
      } catch (error) {
        console.error("Error loading family members: ", error)
        setFamilyMembers(defaultFamilyMembers)
        setActiveMemberId(DEFAULT_MEMBER_ID)
      }
    }

    fetchFamilyMembers()

    return () => {
      isDisposed = true
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(MEMBER_STORAGE_KEY, activeMemberId)

    const timer = window.setTimeout(() => {
      setEditingFoodId("")
      setEditAmount("")
    }, 0)

    return () => window.clearTimeout(timer)
  }, [activeMemberId])

    const saveEdit = async () => {
    const nextInput = Number(editAmount)
    if (!editingFoodId || !Number.isFinite(nextInput) || nextInput <= 0) {
      toast.error("Enter a valid amount before saving.")
      return
    }

    try{
      const updatedFoods = foods.map((f) => {
        if (f.id !== editingFoodId) {
          return f
        }

        const previousMeasurement = Number(f.measurement)
        const servingMeasurement = getServingMeasurement(f)
        const nextFoodMeasurement = servingMeasurement > 0
          ? roundNutrient(nextInput * servingMeasurement)
          : nextInput
        const ratio = previousMeasurement > 0 ? nextFoodMeasurement / previousMeasurement : 1

        return {
          ...f,
          amount: servingMeasurement > 0 ? nextInput : nextFoodMeasurement,
          servings: servingMeasurement > 0 ? nextInput : f.servings,
          measurement: nextFoodMeasurement,
          measurementClassification: normalizeMeasurementLabel(f.measurementClassification),
          servingMeasurementClassification: f.servingMeasurementClassification
            ? normalizeMeasurementLabel(f.servingMeasurementClassification)
            : f.servingMeasurementClassification,
          macronutrients: scaleMacronutrients(f.macronutrients, ratio),
        }
      })

      const res = await authFetch(`/users/me/goal/${dateKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          memberId: activeMemberId,
          foods: updatedFoods
        })
      })
      const data = await res.json()

      if (!res.ok){
        throw new Error(data.error || "Failed to update food item")
      }
      setEditingFoodId("");
      setEditAmount("");
      setFoods(Array.isArray(data.foods) ? data.foods : updatedFoods)
      setGoalProgress(toMacroProgress(data.progress))
      toast.success("Updated food item")
    }
    catch (error) {
      console.error("Error updating food item: ", error)
      toast.error("Failed to update food item. Please try again")
    }
    };

  useEffect(() => {
    // gets goal for current date
     const fetchGoalForCurrentDate = async () => {
      try{
        const res = await authFetch(`/users/me/goal/?date=${dateKey}&${memberQuery}`)
        
        if (!res.ok){
          throw new Error("Unable to fetch goal for current date")
        }

        const data = await res.json()
        setGoalProgress(toMacroProgress(data.progress));
      }
      catch {     
        setGoalProgress(emptyMacroProgress());
          return;
      } 
    };
    // gets food for current date
    const fetchFoodForCurrentDate = async () => {
      try{
        
        const res = await authFetch(`/users/me/goal/foods?date=${dateKey}&${memberQuery}`)
        
        if (!res.ok){
          setFoods([]);
          return;
        }
        const data = await res.json()
        setFoods(Array.isArray(data.foods) ? data?.foods : []);
      }
      catch {
          setFoods([]);
      }
      
    };

    fetchFoodForCurrentDate()
    fetchGoalForCurrentDate()
  }, [dateKey, memberQuery]);

  useEffect(() => {
    if (!user) return

    let socket: WebSocket | null = null
    let reconnectTimer: number | undefined
    let isDisposed = false

    const applyGoalUpdate = (payload: GoalUpdatePayload) => {
      if (payload.date !== dateKey) return
      if ((payload.memberId ?? DEFAULT_MEMBER_ID) !== activeMemberId) return

      if (Array.isArray(payload.foods)) {
        setFoods(payload.foods)
      }

      setGoalProgress(toMacroProgress(payload.progress))
    }

    const connect = async () => {
      try {
        const token = await user.getIdToken()
        if (isDisposed) return

        socket = new WebSocket(getGoalWebSocketUrl(token, dateKey, activeMemberId))

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data) as GoalWebSocketMessage
            if (message.type === 'goal:update' && message.payload) {
              applyGoalUpdate(message.payload)
            }
          } catch (error) {
            console.error("Error reading calorie tracker update: ", error)
          }
        }

        socket.onerror = () => {
          socket?.close()
        }

        socket.onclose = () => {
          if (isDisposed) return
          reconnectTimer = window.setTimeout(connect, 2000)
        }
      } catch (error) {
        console.error("Error connecting calorie tracker updates: ", error)
      }
    }

    connect()

    return () => {
      isDisposed = true
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer)
      }
      socket?.close()
    }
  }, [dateKey, activeMemberId, user]);

  const memberSwitcher = (
    <label className="member-switcher">
      <span>Tracking</span>
      <select
        id="select-family-member"
        value={activeMember?.id || DEFAULT_MEMBER_ID}
        onChange={(event) => setActiveMemberId(event.target.value)}
        aria-label="Select family member"
      >
        {familyMembers.map((member) => (
          <option key={member.id} value={member.id}>{member.name}</option>
        ))}
      </select>
    </label>
  )

  const calorieGoal = goalProgress.calories.goal
  const calorieTotal = goalProgress.calories.total
  const calorieRemaining = goalProgress.calories.remaining
  const calorieProgressPercent = calorieGoal > 0
    ? Math.min(100, Math.max(0, (calorieTotal / calorieGoal) * 100))
    : 0
  const calorieStats = [
    { label: 'Goal', value: formatStatValue(calorieGoal) },
    { label: 'Total', value: formatStatValue(calorieTotal) },
    { label: 'Remaining', value: formatStatValue(calorieRemaining) },
  ]
  const macroStats = [
    { label: 'Carbs', value: `${formatStatValue(goalProgress.carbs)}g`, key: 'carbs' },
    { label: 'Fat', value: `${formatStatValue(goalProgress.fat)}g`, key: 'fat' },
    { label: 'Protein', value: `${formatStatValue(goalProgress.protein)}g`, key: 'protein' },
  ]

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
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} pageTitle={"Calorie Tracker"} pageButton={memberSwitcher}></Header>
        <section className="calorie-tracker-page">
          <section className="nav-days" aria-label="Selected tracking day">
            <div className="nav-items">
              <button type="button" className="nav-day-button" aria-label="Go to previous day" onClick={decrementDate}>
                <ArrowLeftRoundedIcon aria-hidden="true" className="nav-icon" sx={{fontSize: 42}}></ArrowLeftRoundedIcon>
              </button>
              <div className="date">
                <span>Tracking day</span>
                <h2>{date.toLocaleDateString('en-us', {
                  weekday: "short",
                  month: "short",
                  day: "numeric"
                })}</h2>
              </div>
              <button type="button" className="nav-day-button" aria-label="Go to next day" onClick={incrementDate}>
                <ArrowRightRoundedIcon aria-hidden="true" className="nav-icon" sx={{fontSize: 42}}></ArrowRightRoundedIcon>
              </button>
            </div>
          </section>

          <section className="food-stats" aria-label="Daily nutrition progress">
            <div className="calorie-progress">
              <div className="calorie-progress__header">
                <span>Calories</span>
                <strong>{formatStatValue(calorieTotal)} / {formatStatValue(calorieGoal || calorieTotal)} kcal</strong>
              </div>
              <div className="calorie-progress__bar" aria-hidden="true">
                <span style={{ width: `${calorieProgressPercent}%` }} />
              </div>
            </div>
            <div className="food-stats-row">
              {calorieStats.map((stat) => (
                <div className="stat-item" key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
            <div className="food-stats-bottom-row">
              {macroStats.map((stat) => (
                <div className={`stat-item macro-stat macro-stat--${stat.key}`} key={stat.label}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="meal-categories">
            <div className="meal-cat">
              <div className="meal-cat-header">
                <div className="meal-cat-labels">
                  <span>{foods.length} logged</span>
                  <h3 className="meal-title">Tracked Foods</h3>
                </div>
                <Link to={`/calorie-tracking/search-food?date=${dateKey}&${memberQuery}`} className="add-food"><AddCircleIcon aria-hidden="true"></AddCircleIcon>Add Food</Link>
              </div>

              <div className="added-items">
                {foods.length === 0 ? <p className="no-foods-tracked">No foods tracked</p> :
                  foods.map((f) => (
                    <div key={f.id} className="food-item">
                      <div
                        className="left-item"
                        onClick={() => {setEditingFoodId(f.id); setEditAmount(String(getEditableAmount(f) || ''))}}
                      >
                        <div className="food-item__main">
                          <strong>{f.name}</strong>
                          <span>{formatStatValue(toNumber(f.macronutrients?.calories))} kcal</span>
                        </div>
                        {editingFoodId === f.id ? (
                          <div className="calorie-tracking-edit-input">
                            <input autoFocus value={editAmount}
                              onChange={(e) => setEditAmount(e.target.value)}
                              onKeyDown={(e) => {if (e.key === "Enter") {e.preventDefault(); saveEdit()}}}
                              onBlur={() => {setEditAmount(""); setEditingFoodId("")}}
                            />
                            <p>{getEditUnit(f)}</p>
                          </div>)
                          :
                          (<div className="food-item__amount">{formatTrackedFoodAmount(f)}</div>)}
                      </div>
                      <div className="right-item">
                        <button type="button" onClick={() => handleSelectFood(f)} className="details">Details</button>
                        <button type="button" className="delete-food-item" aria-label={`Delete ${f.name}`} onClick={() => handleDeleteFood(f)}><RemoveCircleIcon className="delete-icon"></RemoveCircleIcon></button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        </section>
      </section>
    </main>
  )
   }
   
