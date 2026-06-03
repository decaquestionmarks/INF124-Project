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
import { authFetch } from '../api.ts'
type MacroProgress = {
  calories: {
    goal: number,
    total: number,
    remaining: number
  };
  carbs: number;
  fats: number;
  protein: number
};

type TrackedFood = {
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


export function CalorieTrackingPage(){
  const [editingName, setEditingName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const current = new Date();
  const [date, setDate] = useState(current)
  const [foods, setFoods] = useState<TrackedFood[]>([])
  const [goalProgress, setGoalProgress] = useState<MacroProgress>({
            calories: {
              goal: 0,
              total: 0,
              remaining: 0
            },
            carbs: 0,
            fats: 0,
            protein: 0
          })
  const navigate = useNavigate()
  const handleSelectFood = (name: string) => {
      console.log("name of food to view: ", name)
      navigate(`/calorie-tracking/food?trackedFoodId=${name}`)
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

  const handleDeleteFood = async (name: string) => {
    // make API call to delete food
    try {
      const res = await authFetch(`/users/me/goal/${date.toISOString().slice(0,10)}/${encodeURIComponent(name)}`, {
        method: 'DELETE',
        headers :{
          'Content-Type': 'application/json'
        }
      })
      if (!res.ok){
        throw new Error("Failed to delete food item")
      }
      const data = await res.json()
      const progress = data.progress
      const foods = data.foods
      setGoalProgress({calories: {goal: progress.calories.goal, remaining: progress.calories.remaining, total: progress.calories.total}, carbs: progress.carbs.total, fats: progress.fats.total, protein: progress.protein.total})
      setFoods(Array.isArray(foods) ? foods : [])
      toast.success(`Deleted ${name}`)
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
    try{
      // TODO: connect to backend for updating single food item
      // const updatedFoods = foods.map((f) => {
      //   if (f.name === editingName){
      //     return {...f, amount: editAmount}
      //   }
      //   return f;
      // })
      // const res = await authFetch(`/users/me/goal/${date.toISOString().slice(0,10)}`, { // editing single food item requires sending entire food list for the day, so endpoint is same as adding food item
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify({
      //     foods: updatedFoods
      //   })
      // })
      // const data = await res.json()

      // if (!res.ok){
      //   throw new Error("Failed to update food item")
      // }
      setEditingName("");
      setEditAmount("");
      // setFoods(Array.isArray(data.foods) ? data.foods : [])
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
        const res = await authFetch(`/users/me/goal/?date=${date.toISOString().slice(0,10)}`)
        
        if (!res.ok){
          throw new Error("Unable to fetch goal for current date")
        }

        const data = await res.json()
        console.log("GETTING GOAL FOR DATE: ", data)
        setGoalProgress({
            calories: {
              goal: data.progress.calories.goal ? data.progress.calories.goal : 0,
              total: data.progress.calories.total ? data.progress.calories.total : 0,
              remaining: data.progress.calories.remaining ? data.progress.calories.remaining: 0,
            },
            carbs: data.progress.carbs.total ? data.progress.carbs.total : 0,
            fats: data.progress.fats.total ? data.progress.fats.total : 0,
            protein: data.progress.protein.total ? data.progress.protein.total : 0,
          });
      }
      catch {     
        setGoalProgress({
            calories: {
              goal: 0,
              total: 0,
              remaining: 0,
            },
            carbs: 0,
            fats: 0,
            protein: 0,
          });
          return;
      } 
    };
    // gets food for current date
    const fetchFoodForCurrentDate = async () => {
      try{
        const res = await authFetch(`/users/me/goal/foods?date=${date.toISOString().slice(0,10)}`)
        
        if (!res.ok){
          setFoods([]);
          return;
        }
        const data = await res.json()
        console.log("FOODS DATA: ", data);
        setFoods(Array.isArray(data.foods) ? data?.foods : []);
      }
      catch {
          setFoods([]);
      }
      
    };
    fetchFoodForCurrentDate()
    fetchGoalForCurrentDate()
  }, [date]);

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
              <span>{goalProgress.fats}</span>
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
                <Link to={`/calorie-tracking/search-food?date=${date.toISOString().slice(0,10)}`} className="add-food">Add Food<AddCircleIcon></AddCircleIcon> </Link>              
             </div>
              
              <div className="added-items">
                {foods.length == 0 ? <p className="no-foods-tracked"> No foods tracked</p> : 
                 foods.map((f) => (
                  <div key={f.name} className="food-item">
                    <div className="left-item"
	                      onClick={() => {setEditingName(f.name); setEditAmount(String(f.amount ?? f.measurement ?? ''))}}>
                        
                      {f.name} - {editingName === f.name ? (
                        <div className="calorie-tracking-edit-input">
                        <input autoFocus value={editAmount} 
                          onChange={(e) => setEditAmount(e.target.value)}
                          onKeyDown={(e) => {if (e.key === "Enter") {e.preventDefault(); saveEdit()}}}
                          onBlur={() => {setEditAmount(""); setEditingName("")}}
                          /> 
                        <p> {f.measurementClassification}</p>
                        </div>)
                        
                        :
                        // TODO: CHANGE THIS TO AMOUNT
                      (<div>{f.measurement} {f.measurementClassification}</div>)}
                    </div>
                    {/* (<div>{f.macronutrients?.calories} calories</div>) */}
                    <div className="right-item">
                      <button onClick={() => handleSelectFood(f.name)} className="details">Details</button>
                      <button className="delete-food-item" onClick={() => handleDeleteFood(f.name)}><RemoveCircleIcon className="delete-icon"></RemoveCircleIcon></button>
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
   
