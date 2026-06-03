import { useEffect, useState } from 'react'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './CalorieTrackingPage.css'
import SearchIcon from '@mui/icons-material/Search'
import { SecondaryHeader } from '../components/Header.tsx'
import './SearchFoodPage.css'
import {useLocation, useNavigate } from 'react-router-dom'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import {toast} from 'react-hot-toast'
import { authFetch } from '../api.ts'

// TODO remove mock foods results and search filtering
const mockResults: FoodResult[] = [
  
  {
    name: "Chicken Breast",
    classification: "Meat",
    measurementClassification: "Mass",
    measurement: 165,
    macronutrients: {
      calories: 275,
      fat: 3.6,
      protein: 51,
      carbs: 2
    }
  },
  {
    name: "White Rice",
    classification: "Grains",
    measurementClassification: "Mass",
    measurement: 1,
    macronutrients: {
      calories: 205,
      fat: 0.4,
      protein: 4.3,
      carbs: 45
    }
  },
  {
    name: "Banana",
    classification: "Fruit",
    measurementClassification: "Mass",
    measurement: 1,
    macronutrients: {
      calories: 105,
      fat: 0.4,
      protein: 1.3,
      carbs: 27
    }
  },
  {
    name: "Egg (Boiled)",
    classification: "Protein",
    measurementClassification: "Mass",
    measurement: 1,
    macronutrients: {
      calories: 78,
      fat: 5.3,
      protein: 6.3,
      carbs: 0.6
    }
  },
  {
    name: "Greek Yogurt",
    classification: "Dairy",
    measurementClassification: "Mass",
    measurement: 150,
    macronutrients: {
      calories: 120,
      fat: 4,
      protein: 15,
      carbs: 5
    }
  },
  {
    name: "Peanut Butter",
    classification: "Fats",
    measurementClassification: "Mass",
    measurement: 2,
    macronutrients: {
      calories: 190,
      fat: 16,
      protein: 7,
      carbs: 7
    }
  },
  {
    name: "Oatmeal",
    classification: "Pantry",
    measurementClassification: "Mass",
    measurement: 40,
    macronutrients: {
      calories: 150,
      fat: 3,
      protein: 5,
      carbs: 27
    }
  },
  {
    name: "Salmon",
    classification: "Meat",
    measurementClassification: "Mass",
    measurement: 100,
    macronutrients: {
      calories: 208,
      fat: 13,
      protein: 20,
      carbs: 0
    }
  },
  {
    name: "Avocado",
    classification: "Produce",
    measurementClassification: "Mass",
    measurement: 1,
    macronutrients: {
      calories: 240,
      fat: 22,
      protein: 3,
      carbs: 13
    }
  },
  {
    name: "Whole Wheat Bread",
    classification: "Bakery",
    measurementClassification: "Mass",
    measurement: 1,
    macronutrients: {
      calories: 80,
      fat: 1,
      protein: 4,
      carbs: 14
    }
  }
];

type SearchFoodProps = {
    linkBack: string
}

type FoodResult = {
  name: string,
  classification: string,
  measurementClassification: string,
  measurement: number,
  macronutrients: {
    calories: number,
    fat: number,
    protein: number,
    carbs: number
  }
}

export function SearchFoodPage({linkBack}: SearchFoodProps){
  const [searchResults, setSearchResults] = useState<FoodResult[]>([])
  const navigate = useNavigate()

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const meal = params.get('meal');
  const date = params.get('date');

  const [addedItem, setAddedItem] = useState<FoodResult | null>(null)
  const [userInput, setUserInput] = useState("")
  const [servingSize, setServingSize] = useState("1")


//  const handleSubmitSearch = async (e: React.FormEvent) => {
  // make call to actual API here
//     e.preventDefault()
//     if (!userInput.trim()) return;
//     try{
//       //make call
//       // set search results
//       setSearchResults([])

//     }
//     catch (error){
//       console.error("ERROR SearchFoodPage", error)
//     }
//  }
const handleSubmitSearch = async (e: React.FormEvent) => {
  e.preventDefault()
  if (!userInput.trim()) return

  try {
    // simulate filtering
    const filtered = mockResults.filter(food =>
      food.name.toLowerCase().includes(userInput.toLowerCase())
    )
    setSearchResults(filtered)
  } catch (error) {
    console.error("ERROR SearchFoodPage", error)
  }
}


 const handleLogFood = async () => {
    if (linkBack === '/fridge'){
      try{
      
        const res = await authFetch('/users/me/fridge',
          {
          method: 'POST',
          headers: {'Content-type': 'application/json'},
          body: JSON.stringify({
              name: addedItem?.name,
              classification: addedItem?.classification,
              measurementClassification: addedItem?.measurementClassification,
              measurement: servingSize,
              macronutrients: {
                calories: addedItem?.macronutrients.calories,
                fat: addedItem?.macronutrients.fat,
                protein: addedItem?.macronutrients.protein,
                carbs: addedItem?.macronutrients.carbs
              }
          })
          }
        )
        if (!res.ok){
          throw new Error("Failed to add food to fridge")
        }

        toast.success(`Added ${addedItem?.name} to fridge`)
      }
      catch (error){
        console.error("Error adding food to fridge: ", error)
        toast.error("Failed to add food to fridge. Please try again")
      }
  }
  else if (linkBack == '/calorie-tracking') { // adding food to calorie tracker
    try{
      const goalDate = date ?? new Date().toISOString().slice(0, 10)
      const res = await authFetch(`/users/me/goal/${goalDate}/foods`,
        {
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify({
            name: addedItem?.name,
            // classification: "Produce",
            measurementClassification: "Mass",
            measurement: Number(servingSize),
            macronutrients: {
              calories: calories,
              // fat: addedItem?.macronutrients.fat,
              protein: protein,
              // carbs: addedItem?.macronutrients.carbs
            }
            
        })
        });
        if (!res.ok){
          throw new Error("Failed to log food to calorie tracker")
        }
        toast.success(`Logged ${addedItem?.name} to calorie tracker`)
      }
      catch (error) {
        console.error("Error logging food to calorie tracker: ", error)
        toast.error("Failed to log food. Please try again")
      }
  }
    navigate(linkBack, 
      {state: {meal, date, addedItem}})
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

  const ratio = addedItem ? (Number(servingSize) / addedItem.measurement) : 1
  const calories = addedItem ? Number(((addedItem.macronutrients.calories) * ratio).toFixed(1)) : 0
  const protein = addedItem ? Number((addedItem.macronutrients.protein * ratio).toFixed(1)) : 0
  const fat = addedItem ? Number((addedItem.macronutrients.fat * ratio).toFixed(1)) : 0
  const carbs = addedItem ? Number((addedItem.macronutrients.carbs * ratio).toFixed(1)) : 0
  
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
            <SecondaryHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} pageTitle={"Food Finder"} linkBack={linkBack}></SecondaryHeader>
            <section>

                
                <form onSubmit={handleSubmitSearch} className="search-form">
                    <SearchIcon aria-hidden="true" className="search-icon"></SearchIcon>
                    <input id="search-bar-input" value={userInput} onChange={(e) => setUserInput(e.target.value)} aria-label="Search Foods" type="search" placeholder="Search Foods" className="search-bar" autoComplete="off" />
                </form>

              </section>
              <section className="search-results">
                {searchResults.map((result) => (                  
                  <div onClick={() => setAddedItem(result)} key={result.name} className="search-item">
                    <div className={`search-item-heading ${addedItem?.name === result.name ? "added" : ""}`}>
                      
                      <span>{result.name}</span>
                    <div className="amount-and-unit">
                      <span>{result.measurement}</span>
                      <span>{result.measurementClassification}</span>
                    </div>
                    
                    <span> {result.macronutrients.calories} cal</span>
                    <button aria-label="Add item" className="add-icon"  
                      id="add-item-button"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setAddedItem(result);
                        }}>
                      {(addedItem?.name === result.name) ?
                        (<RemoveCircleIcon aria-hidden="true" fontSize='medium'/>) : 
                        (<AddCircleIcon aria-hidden="true" fontSize='medium'/>)
                      }

                      
                      </button>
                    
                    </div>
                  </div>
                ))}
              </section>
            {addedItem !== null && 
            <section className="macros-and-measurement-amount">
                  <span className="added-item-name">{addedItem?.name}</span>
                    <div className="macros">
                      <span>Calories: {calories}</span>
                      <span>Carbs: {carbs}</span>
                      <span>Fat: {fat}</span>
                      <span>Protein: {protein}</span>
                      
                    </div>
                    <div className="serving-inputs">
                      <label htmlFor="serving-size">Serving Size:</label>
                      <input className="serving-size" name="serving-size" id="serving-size" type="number" value={servingSize} min="1" onChange={(e) => {const value = e.target.value; if (Number(value) >= 1 || value === "" ){ setServingSize(e.target.value)}}}/>
                      <span>unit</span>
                    </div>
                  <div className="save-bar">
                    <button onClick={handleLogFood} className="save-button" disabled={servingSize === ""}>Log</button>
                  </div>

                </section>}

         </section>
   

         
       </main>
     )
   }
   

export default SearchFoodPage
