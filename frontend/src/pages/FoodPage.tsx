import { useEffect, useState } from 'react'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './FoodPage.css'
import { SecondaryHeader } from '../components/Header.tsx'
import {useNavigate, useLocation } from 'react-router-dom'
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';

// type Ingredient = {
//   name: string;
//   classification: string
//   measurementClassification: string
//   measurement: string
// }
// type FoodItem= {
//   name: string,
//   foodId: string,
//   amount: string, 
//   caloriesPerUnit: string,
//   proteinPerUnit: string,
//   carbsPerUnit: string,
//   fatPerUnit: string
// }

const food_item = {name: "Scrambled Eggs", foodId: "1", amount: "2", baseAmount: "1", caloriesPerUnit: "60", carbsPerUnit: "2", fatPerUnit: "5", proteinPerUnit: "10"}

export function FoodPage(){
    const [amount, setAmount] = useState(Number(food_item.amount))
    const baseAmount = Number(food_item?.amount) || 100
    const ratio = amount / baseAmount
    const cal = Math.round((Number(food_item?.caloriesPerUnit) || 0) * ratio)
    const carb = Math.round((Number(food_item?.carbsPerUnit) || 0) * ratio)
    const fat = Math.round((Number(food_item?.fatPerUnit) || 0) * ratio)
    const protein = Math.round((Number(food_item?.proteinPerUnit) || 0) * ratio)

    const location = useLocation()
    const params = new URLSearchParams(location.search)
    const date = params.get('date')
    const meal = params.get('meal')
    const name = params.get('name')


    const handleSaveAmount = () => {
        // make call to update goal foods
        // need to figure out how we want to update individual food items
    }


    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > 900
  })

  const navigate = useNavigate()

  const deleteFoodItem = () => {
    // const res = fetch(`http://127.0.0.1:3000/me/goals/foods?date=${}`)
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

  const handleSave = (e: React.FormEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // make API CALL
    navigate('/calorie-tracking')
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
            <SecondaryHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} pageTitle={"Mock Food"} linkBack="/calorie-tracking"></SecondaryHeader>
            <div className="top-delete-section">
                <button onClick={deleteFoodItem}><DeleteRoundedIcon className="trash-icon"></DeleteRoundedIcon></button>
            </div>
            <section className="food-page">
                <div className="amount">
                    <label htmlFor="amount">Amount:</label>
                    
                    <div className="amount-and-label">
                        <input className="amount-input" id="amount" type="number" 
                            value={amount}
                            min={0.1}
                            step={0.1}
                            onChange={(e) => setAmount(Number(e.target.value))}
                        />
                        <span>g</span>
                    </div>
                </div>

                <div className="overall-macros">
                    <div className="macro-row">
                        <span>Calories:</span>
                        <span>{cal}</span>
                    </div>
   
                    <div className="macro-row">
                        <span>Fat:</span>
                        <span>{fat}</span>
                    </div>
                    <div className="macro-row">
                        <span>Protein:</span>
                        <span>{protein}</span>
                    </div>
                    <div className="macro-row">
                        <span>Carbs:</span>
                        <span>{carb}</span>
                    </div>
         



                </div>
                <div className="save-bar">
                    <button onClick={handleSave} className="save-button">Save</button>
                </div>
            </section>
        </section>
       </main>
     )
   }
   