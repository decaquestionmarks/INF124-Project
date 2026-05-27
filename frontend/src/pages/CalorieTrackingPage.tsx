import { useEffect, useState, type JSX } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './CalorieTrackingPage.css'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {Header} from '../components/Header.tsx'
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import ArrowLeftRoundedIcon from '@mui/icons-material/ArrowLeftRounded';
// import EggRoundedIcon from '@mui/icons-material/EggRounded';
// import LunchDiningRoundedIcon from '@mui/icons-material/LunchDiningRounded';
// import DinnerDiningRoundedIcon from '@mui/icons-material/DinnerDiningRounded';
// import IcecreamRoundedIcon from '@mui/icons-material/IcecreamRounded';

// const meals: {title: MealType; icon: JSX.Element}[] =[
//   {title: "Breakfast", icon: <EggRoundedIcon aria-hidden="true" className="meal-icon"/>},
//   {title: "Lunch", icon: <LunchDiningRoundedIcon aria-hidden="true" className="meal-icon"/>},
//   {title: "Dinner", icon: <DinnerDiningRoundedIcon aria-hidden="true" className="meal-icon"/>},
//   {title: "Snacks", icon: <IcecreamRoundedIcon aria-hidden="true" className="meal-icon"/>}
// ]



export function CalorieTrackingPage(){
  const current = new Date();
  const [date, setDate] = useState(current)
  const [foods, setFoods] = useState<any[]>([])
  const navigate = useNavigate()


  const handleSelectFood = (name: string) => {
      // navigate to associated food page,
      // on page user can edit amounts and will send post
      navigate(`/calorie-tracking/food?name=${name}&date=${date.toISOString().slice(0,10)}`)
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
    const fetchFoodForCurrentDate = async () => {
      try{
        const res = await fetch(`http://127.0.0.1:3000/users/me/goal/foods?date=${date.toISOString().slice(0,10)}`)
        const data = await res.json()

        if (!res.ok || !data?.foods) {
          setFoods([]); // important fallback
          return;
        }
       setFoods(data?.foods)
      }
      catch (err) {
          setFoods([]);
      }
      
    };
    fetchFoodForCurrentDate()
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
              <span>?</span>
            </div>
             <div className="stat-item">
              <span>Remaining</span><br />
              <span>?</span>
            </div>
             <div className="stat-item">
              <span>Eaten</span><br />
              <span>?</span>
            </div>
          
          </div>
          <div className="food-stats-row">
             <div className="stat-item">
              <span>Carbs</span><br />
              <span>?</span>
            </div>
             <div className="stat-item">
              <span>Fat</span><br />
              <span>?</span>
            </div>
             <div className="stat-item">
              <span>Protein</span><br />
              <span>?</span>
            </div>

          </div>

        <section className="meal-categories">
          
            <div  className="meal-cat">
              <div className="meal-cat-header">
                <div className="meal-cat-labels">
                 <h3 className="meal-title">Meals</h3>
                </div>
                <Link to={`/calorie-tracking/search-food?date=${date.toISOString().slice(0,10)}`} className="add-food">Add Food<AddCircleIcon></AddCircleIcon> </Link>              
             </div>
              
              <div className="added-items">
                 {foods.map((f) => (
                  <div key={f.id} className="food-item">
                    <div className="left-item">{f.name}</div>
                    <div className="middle-item">
                      Calories: {f.macronutrients.calories}
                      </div>
                      <div className="right-item">
                        <button onClick={() => handleSelectFood(f.name)} className="details">Details</button>
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
   