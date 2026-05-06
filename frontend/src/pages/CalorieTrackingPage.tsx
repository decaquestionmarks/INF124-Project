import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './CalorieTrackingPage.css'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {Header} from '../components/Header.tsx'
import ArrowRightRoundedIcon from '@mui/icons-material/ArrowRightRounded';
import ArrowLeftRoundedIcon from '@mui/icons-material/ArrowLeftRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import EggRoundedIcon from '@mui/icons-material/EggRounded';
import LunchDiningRoundedIcon from '@mui/icons-material/LunchDiningRounded';
import DinnerDiningRoundedIcon from '@mui/icons-material/DinnerDiningRounded';
import IcecreamRoundedIcon from '@mui/icons-material/IcecreamRounded';

const meals = [
  {title: "Breakfast", icon: <EggRoundedIcon aria-hidden="true" className="meal-icon"/>},
  {title: "Lunch", icon: <LunchDiningRoundedIcon aria-hidden="true" className="meal-icon"/>},
  {title: "Dinner", icon: <DinnerDiningRoundedIcon aria-hidden="true" className="meal-icon"/>},
  {title: "Snacks", icon: <IcecreamRoundedIcon aria-hidden="true" className="meal-icon"/>}
]

export function CalorieTrackingPage(){
  const current = new Date();
  const [date, setDate] = useState(current)


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
              <output>?</output>
            </div>
             <div className="stat-item">
              <span>Remaining</span><br />
              <output>?</output>
            </div>
             <div className="stat-item">
              <span>Eaten</span><br />
              <output>?</output>
            </div>
          
          </div>
          <div className="food-stats-row">
             <div className="stat-item">
              <span>Carbs</span><br />
              <output>?</output>
            </div>
             <div className="stat-item">
              <span>Fat</span><br />
              <output>?</output>
            </div>
             <div className="stat-item">
              <span>Protein</span><br />
              <output>?</output>
            </div>

          </div>

        <section className="meal-categories">
          {meals.map((m) => (
            <div key={m.title} className="meal-cat">
              <div className="meal-cat-header">
                <div className="meal-cat-labels">
                 <h3 className="meal-title">{m.icon} {m.title}</h3>
              </div>
                <Link to="/calorie-tracking/search-food" className="add-food">Add Food<AddCircleIcon></AddCircleIcon> </Link>              
              </div>
              
              <div className="added-items"></div>
            </div>
            
            
          ))}      
          

        </section>
        
        </section>


         </section>

         
       </main>
     )
   }
   