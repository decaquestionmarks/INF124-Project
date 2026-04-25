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
  {title: "Breakfast", icon: <EggRoundedIcon className="meal-icon"/>},
  {title: "Lunch", icon: <LunchDiningRoundedIcon className="meal-icon"/>},
  {title: "Dinner", icon: <DinnerDiningRoundedIcon className="meal-icon"/>},
  {title: "Snacks", icon: <IcecreamRoundedIcon className="meal-icon"/>}
]

export function CalorieTrackingPage(){

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
          <div className="dummy-item"></div>
          <div className="nav-items">
            <button aria-label="Go to previous day"><ArrowLeftRoundedIcon className="nav-icon" sx={{fontSize: 70}}></ArrowLeftRoundedIcon></button>
            <span>Today</span>
            <button aria-label="Go to next day"><ArrowRightRoundedIcon className="nav-icon"  sx={{fontSize: 70}}></ArrowRightRoundedIcon></button>            
          </div>
          <button className="share-button" aria-label="Share"><ShareRoundedIcon  sx={{fontSize: 30}}></ShareRoundedIcon></button>
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
          {meals.map((m) => (
            <div className="meal-cat">
              <div className="meal-cat-labels">
                 <span className="meal-icon">{m.icon}</span>
                 <span className="meal-title">{m.title}</span>
              </div>
             
              <Link to="/search-food" className="add-food" aria-hidden="true">Add Food < AddCircleIcon></AddCircleIcon> </Link>
            </div>
          ))}          
        </section>
        </section>


         </section>

         
       </main>
     )
   }
   