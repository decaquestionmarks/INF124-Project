import { useEffect, useState } from 'react'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './FoodPage.css'
import { SecondaryHeader } from '../components/Header.tsx'


export function FoodPage(){
  // change this to match to fetch
  const temp_vals = 0
  

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
            <SecondaryHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} pageTitle={"Mock Food"} linkBack="/calorie-tracking"></SecondaryHeader>
            <section className="food-page">

                <div className="overall-macros">
                  <div className="macro-row">
                        <span>Amount:</span>
                         <span>{temp_vals} g</span>
                    </div>
                    <div className="macro-row">
                        <span>Calories:</span>
                        <span>{temp_vals}</span>
                    </div>
   
                    <div className="macro-row">
                        <span>Fat:</span>
                        <span>{temp_vals} g</span>
                    </div>
                    <div className="macro-row">
                        <span>Protein:</span>
                        <span>{temp_vals} g</span>
                    </div>
                    <div className="macro-row">
                        <span>Carbs:</span>
                        <span>{temp_vals} g</span>
                    </div>
                </div>
            </section>
        </section>
       </main>
     )
   }
   