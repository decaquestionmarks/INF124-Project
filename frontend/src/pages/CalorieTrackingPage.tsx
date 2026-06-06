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
  macronutrients: {
    calories?: number;
    carbs?: number;
    fat?: number;
    protein?: number;
  };
};

type ProgressNutrient = {
  goal?: number;
  total?: number;
  remaining?: number;
};

type GoalUpdatePayload = {
  date?: string;
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

const scaleMacronutrients = (macronutrients: TrackedFood['macronutrients'], ratio: number) => ({
  calories: roundNutrient(toNumber(macronutrients.calories) * ratio),
  carbs: roundNutrient(toNumber(macronutrients.carbs) * ratio),
  fat: roundNutrient(toNumber(macronutrients.fat) * ratio),
  protein: roundNutrient(toNumber(macronutrients.protein) * ratio),
})

export function CalorieTrackingPage(){
  const [editingFoodId, setEditingFoodId] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const current = new Date();
  const [date, setDate] = useState(current)
  const dateKey = date.toISOString().slice(0,10)
  const [foods, setFoods] = useState<TrackedFood[]>([])
  const [goalProgress, setGoalProgress] = useState<MacroProgress>(() => emptyMacroProgress())
  const navigate = useNavigate()
  const { user } = useAuth()
  const handleSelectFood = (food: TrackedFood) => {
      navigate(`/calorie-tracking/food?trackedFoodId=${encodeURIComponent(food.id)}&date=${dateKey}`)
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
      const res = await authFetch(`/users/me/goal/${dateKey}/${encodeURIComponent(food.id)}`, {
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

    const saveEdit = async () => {
    const nextMeasurement = Number(editAmount)
    if (!editingFoodId || !Number.isFinite(nextMeasurement) || nextMeasurement <= 0) {
      toast.error("Enter a valid amount before saving.")
      return
    }

    try{
      const updatedFoods = foods.map((f) => {
        if (f.id !== editingFoodId) {
          return f
        }

        const previousMeasurement = Number(f.measurement)
        const ratio = previousMeasurement > 0 ? nextMeasurement / previousMeasurement : 1

        return {
          ...f,
          measurement: nextMeasurement,
          macronutrients: scaleMacronutrients(f.macronutrients, ratio),
        }
      })

      const res = await authFetch(`/users/me/goal/${dateKey}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
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
        const res = await authFetch(`/users/me/goal/?date=${dateKey}`)
        
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
        
        const res = await authFetch(`/users/me/goal/foods?date=${dateKey}`)
        
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
  }, [dateKey]);

  useEffect(() => {
    if (!user) return

    let socket: WebSocket | null = null
    let reconnectTimer: number | undefined
    let isDisposed = false

    const applyGoalUpdate = (payload: GoalUpdatePayload) => {
      if (payload.date !== dateKey) return

      if (Array.isArray(payload.foods)) {
        setFoods(payload.foods)
      }

      setGoalProgress(toMacroProgress(payload.progress))
    }

    const connect = async () => {
      try {
        const token = await user.getIdToken()
        if (isDisposed) return

        socket = new WebSocket(getGoalWebSocketUrl(token, dateKey))

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
  }, [dateKey, user]);

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
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} pageTitle={"Calorie Tracker"}></Header>
        <section className="nav-days">
          <div className="nav-items">
            <button aria-label="Go to previous day" onClick={decrementDate}><ArrowLeftRoundedIcon aria-hidden="true" className="nav-icon" sx={{fontSize: 70}}></ArrowLeftRoundedIcon></button>
            <div className="date">
              <h2>{date.toLocaleDateString('en-us', {
              weekday: "short",
              month: "short",
              day: "numeric"
              }
              )}</h2>
            </div>
            
            <button aria-label="Go to next day" onClick={incrementDate}><ArrowRightRoundedIcon aria-hidden="true" className="nav-icon"  sx={{fontSize: 70}}></ArrowRightRoundedIcon></button>            
          </div>
          {/* <button className="share-button" aria-label="Share"><ShareRoundedIcon  sx={{fontSize: 30}}></ShareRoundedIcon></button> */}
        </section>
        <section className="food-stats">
          <div className="food-stats-row">


            <div className="stat-item">
              <span>Goal</span><br />
              <span>{goalProgress.calories.goal}</span>
            </div>
             <div className="stat-item">
              <span>Total</span><br />
              <span>{goalProgress.calories.total}</span>
            </div>
             <div className="stat-item">
              <span>Remaining</span><br />
              <span>{goalProgress.calories.remaining}</span>
            </div>
            
          
          </div>
          <div className="food-stats-bottom-row">
             <div className="stat-item">
              <span>Carbs</span><br />
              <span>{goalProgress.carbs}</span>
            </div>
	             <div className="stat-item">
	              <span>Fat</span><br />
	              <span>{goalProgress.fat}</span>
	            </div>
             <div className="stat-item">
              <span>Protein</span><br />
              <span>{goalProgress.protein}</span>
            </div>

          </div>
              </section>
        <section className="meal-categories">
          
            <div  className="meal-cat">
              <div className="meal-cat-header">
                <div className="meal-cat-labels">
                 <h3 className="meal-title">Tracked Foods</h3>
                </div>
                <Link to={`/calorie-tracking/search-food?date=${dateKey}`} className="add-food">Add Food<AddCircleIcon></AddCircleIcon> </Link>              
             </div>
              
              <div className="added-items">
                {foods.length == 0 ? <p className="no-foods-tracked"> No foods tracked</p> : 
                 foods.map((f) => (
                  <div key={f.id} className="food-item">
                    <div className="left-item"
	                      onClick={() => {setEditingFoodId(f.id); setEditAmount(String(f.amount ?? f.measurement ?? ''))}}>
                        
                      {f.name} - {editingFoodId === f.id ? (
                        <div className="calorie-tracking-edit-input">
                        <input autoFocus value={editAmount} 
                          onChange={(e) => setEditAmount(e.target.value)}
                          onKeyDown={(e) => {if (e.key === "Enter") {e.preventDefault(); saveEdit()}}}
                          onBlur={() => {setEditAmount(""); setEditingFoodId("")}}
                          /> 
                        <p> {f.measurementClassification}</p>
                        </div>)
                        
                        :
                        // TODO: CHANGE THIS TO AMOUNT
                      (<div>{f.measurement} {f.measurementClassification}</div>)}
                    </div>
                    {/* (<div>{f.macronutrients?.calories} calories</div>) */}
                    <div className="right-item">
                      <button onClick={() => handleSelectFood(f)} className="details">Details</button>
                      <button className="delete-food-item" onClick={() => handleDeleteFood(f)}><RemoveCircleIcon className="delete-icon"></RemoveCircleIcon></button>
                    </div>
                  </div>
                  ))}
              </div>
            </div>
        </section>
        </section>
   
       </main>
     )
   }
   
