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
const mockResults: FoodResult[] = [
  
  {
    name: "Chicken Breast",
    classification: "Meat",
    measurementClassification: "g",
    measurement: 165,
    macronutrients: {
      calories: 275,
      fat: 3.6,
      protein: 51
    }
  },
  {
    name: "White Rice",
    classification: "Grains",
    measurementClassification: "cup",
    measurement: 1,
    macronutrients: {
      calories: 205,
      fat: 0.4,
      protein: 4.3
    }
  },
  {
    name: "Banana",
    classification: "Fruit",
    measurementClassification: "medium",
    measurement: 1,
    macronutrients: {
      calories: 105,
      fat: 0.4,
      protein: 1.3
    }
  },
  {
    name: "Egg (Boiled)",
    classification: "Protein",
    measurementClassification: "large",
    measurement: 1,
    macronutrients: {
      calories: 78,
      fat: 5.3,
      protein: 6.3
    }
  },
  {
    name: "Greek Yogurt",
    classification: "Dairy",
    measurementClassification: "g",
    measurement: 150,
    macronutrients: {
      calories: 120,
      fat: 4,
      protein: 15
    }
  },
  {
    name: "Peanut Butter",
    classification: "Fats",
    measurementClassification: "tbsp",
    measurement: 2,
    macronutrients: {
      calories: 190,
      fat: 16,
      protein: 7
    }
  },
  {
    name: "Oatmeal",
    classification: "Grains",
    measurementClassification: "g",
    measurement: 40,
    macronutrients: {
      calories: 150,
      fat: 3,
      protein: 5
    }
  },
  {
    name: "Salmon",
    classification: "Meat",
    measurementClassification: "g",
    measurement: 100,
    macronutrients: {
      calories: 208,
      fat: 13,
      protein: 20
    }
  },
  {
    name: "Avocado",
    classification: "Fruit",
    measurementClassification: "medium",
    measurement: 1,
    macronutrients: {
      calories: 240,
      fat: 22,
      protein: 3
    }
  },
  {
    name: "Whole Wheat Bread",
    classification: "Grains",
    measurementClassification: "slice",
    measurement: 1,
    macronutrients: {
      calories: 80,
      fat: 1,
      protein: 4
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
  }
}



export function SearchFoodPage({linkBack}: SearchFoodProps){
  const [searchResults, setSearchResults] = useState<FoodResult[]>([])
  const navigate = useNavigate()

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const meal = params.get('meal');
  const date = params.get('date');

  const [addedItem, setAddedItem] = useState("")
 const [userInput, setUserInput] = useState("")


//  const handleSubmitSearch = async (e: React.FormEvent) => {
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
   
  // fetch and figure out what to pass
  console.log("HERE", linkBack)
  if (linkBack === '/fridge'){
    // sending temp stuff until food routes done
    const res = await fetch(`http://127.0.0.1:3000/users/me/fridge`,
      {
      method: 'POST',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
          name: addedItem,
          classification: "Produce",
          measurementClassification: "Mass",
          measurement: "100",
           macronutrients: {
            calories: 275,
            fat: 3.6,
            protein: 51
          }

      })
      }
    )
    const data = await res.json()
    console.log("DATA:", data)
  }
  else if (linkBack == '/calorie-tracking') { // adding food to calorie tracker
    // sending temp stuff until food route done
    console.log("ADDING FOOD TO CALORIE TRACKER")
    const res = await fetch(`http://127.0.0.1:3000/users/me/goal/${date}/foods`,
      {
      method: 'POST',
      headers: {'Content-type': 'application/json'},
      body: JSON.stringify({
          name: addedItem,
          classification: "Produce",
          measurementClassification: "Mass",
          measurement: "100",
           macronutrients: {
            calories: 275,
            fat: 3.6,
            protein: 51
          }
          
      })
      });
      const data = await res.json()
      console.log("DATA:", data)
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
                  <div onClick={() => setAddedItem(result.name)} key={result.name} className="search-item">
                    <div className={`search-item-heading ${addedItem === result.name ? "added" : ""}`}>
                      
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
                        setAddedItem(result.name);
                        }}>
                      {(addedItem === result.name) ?
                        (<RemoveCircleIcon aria-hidden="true" fontSize='medium'/>) : 
                        (<AddCircleIcon aria-hidden="true" fontSize='medium'/>)
                      }

                      
                      </button>
                    
                    </div>
                  </div>
                ))}
              </section>
            {addedItem !== "" && 
            <section className="macros-and-measurement-amount">
                  <span className="added-item-name">{addedItem}</span>
                    <div className="macros">
                      <span>Calories: ?</span>
                      <span>Carbs: ?</span>
                      <span>Fat: ?</span>
                      <span>Protein: ?</span>
                      
                    </div>
                    <div className="serving-inputs">
                      <label htmlFor="serving-size">Serving Size:</label>
                      <input className="serving-size" name="serving-size" id="serving-size" type="text" />
                      <span>unit</span>
                    </div>
                  <div className="save-bar">
                    <button onClick={handleLogFood} className="save-button">Log</button>
                  </div>

                </section>}

         </section>
   

         
       </main>
     )
   }
   

export default SearchFoodPage