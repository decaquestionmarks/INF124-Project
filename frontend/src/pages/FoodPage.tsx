import { useEffect, useState } from 'react'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './FoodPage.css'
import { SecondaryHeader } from '../components/Header.tsx'
import { useLocation } from 'react-router-dom'
import { authFetch } from '../api.ts'


export function FoodPage(){
  // change this to match to fetch
  const location = useLocation();
  const params = new URLSearchParams(location.search)
  const foodName = params.get('trackedFoodName')
  const [amount, setAmount] = useState(0)
  const [unit, setUnit] = useState("")
  const [macros, setMacros] = useState({
        calories: 0,
        fat: 0,
        protein: 0,
        carbs: 0
      });
  

  console.log("FOOD NAME: ", foodName);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > 900
  })

  useEffect(() => {
    if (!foodName) return;
    const handleFetchFoodDetails = async () => {
      const res = await authFetch(`/foods/${foodName}`)
      const data = await res.json()
      setMacros({
        calories: data.macronutrients?.calories ?? 0,
        fat: data.macronutrients?.fat ?? 0,
        protein: data.macronutrients?.protein ?? 0,
        carbs: data.macronutrients?.carbs ?? 0
      });
      setAmount(data.measurement);
      setUnit(data.measurementClassification);

      console.log("FETCHED FOOD DETAILS: ", data)
    }
    handleFetchFoodDetails()
  }, [foodName])

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
                         <span>{amount} {unit}</span>
                    </div>
                    <div className="macro-row">
                        <span>Calories:</span>
                        <span>{macros.calories}</span>
                    </div>
   
                    <div className="macro-row">
                        <span>Fat:</span>
                        <span>{macros.fat} g</span>
                    </div>
                    <div className="macro-row">
                        <span>Protein:</span>
                        <span>{macros.protein} g</span>
                    </div>
                    <div className="macro-row">
                        <span>Carbs:</span>
                        <span>{macros.carbs} g</span>
                    </div>
                </div>
            </section>
        </section>
       </main>
     )
   }
   