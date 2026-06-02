import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './FridgePage.css'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Header } from '../components/Header.tsx'
import {toast} from 'react-hot-toast'

const FOOD_CATEGORIES = [
  "Produce",
  "Dairy",
  "Meat",
  "Bakery",
  "Pantry",
  "Frozen",
  "Drinks",
  "Snacks",
  "Spices and Baking",
  "Condiments"
] as const;

type FoodCategory = typeof FOOD_CATEGORIES[number];

type Food = {
  id: string;
  name: string;
  classification: FoodCategory;
  measurementClassification: string;
  measurement: number;
  macronutrients: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

function useAssociatedItems(itemList: Food[] = []) {
  return useMemo(() => {
    const mapping: Record<FoodCategory, Food[]> = {
      Produce: [],
      Dairy: [],
      Meat: [],
      Bakery: [],
      Pantry: [],
      Frozen: [],
      Drinks: [],
      Snacks: [],
      'Spices and Baking': [],
      Condiments: [],

    };

    
    itemList?.forEach?.(item => {
      mapping[item.classification].push(item);
    });

    return mapping;
  }, [itemList]);
}

export function FridgePage(){
  const [poppedDownCategory, setPoppedDownCategory] = useState<FoodCategory[]>([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
      if (typeof window === 'undefined') {
        return true
      }

      return window.innerWidth > 900
    })

  const [dropDownOpen, setDropDownOpen] = useState(false);
  
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

  const [foodItems, setFoodItems] = useState<Food[]>([])
  const foodsByCategory = useAssociatedItems(foodItems);

    useEffect(() => {
    const fetchFridgeItems = async () => {
        // getting items from users fridge
        const res = await fetch(`http://127.0.0.1:3000/users/me/fridge`)
        const data = await res.json();
        console.log("DATA.fridge: ", data.fridge)
        setFoodItems(Array.isArray(data?.fridge) ? data.fridge : []);
        
    }
    fetchFridgeItems()
  }, [])


  const handleDeleteFood = async (name: string) => {
      try{
        const res = await fetch(`http://127.0.0.1:3000/users/me/fridge/${name}`, 
        {  
          headers: {'Content-type': 'application/json'},
          method: "DELETE",
         }
        )
        if (!res.ok){
          throw new Error(`Failed to delete food item: ${name}`)
        }
        const data = await res.json();
        setFoodItems(Array.isArray(data?.fridge) ? data.fridge : []);
        toast.success(`Successfully deleted ${name} from fridge`)
      } 
      catch (error) {
        toast.error('Failed to delete food item. Please try again')
        console.error("Error deleting food item: ", error)
      }
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
        <Header setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} pageTitle="Fridge"></Header>

        <section className="food-items">
            <div className="add-food-options">
              <div className="dropdown-parent">
                <div className={`dropdown ${dropDownOpen ? "open" : ""}`}>
                    <button className="expand-dropdown" aria-label="Add Ingredients" onClick={() => (setDropDownOpen(!dropDownOpen))}>Add Ingredients 
                      <KeyboardArrowDownRoundedIcon sx={{transition: "transform 160ms ease", transform: dropDownOpen ? "rotate(180deg)" : "rotate(0deg"}}></KeyboardArrowDownRoundedIcon></button>

                  <div className="dropdown-menu">
                    <Link className="dropdown-option" to="/fridge/search-food?mode=fridge">
                      Add to Fridge <AddCircleIcon aria-hidden="true" />
                    </Link>
                  </div>
                </div>
            </div>

              
            </div>
              {FOOD_CATEGORIES.map((category) => (
                  <div key={category} className="category">
                      <div className={`food-item-heading ${poppedDownCategory.includes(category) ? "active" : ""}`}
                       onClick={(e) => {e.stopPropagation;         
                                        setPoppedDownCategory((prev) =>
                                          prev.includes(category)
                                            ? prev.filter((c) => c !== category)
                                            : [...prev, category]
                                        );
                              }}>
                          <div className="left-items">
                          <button aria-label="Expand" onClick={(e) => {
                                      e.stopPropagation();
                                      setPoppedDownCategory((prev) =>
                                        prev.includes(category)
                                          ? prev.filter((c) => c !== category)
                                          : [...prev, category]
                                      );
                                    
                              }}>
                              <KeyboardArrowDownRoundedIcon className={`down-icon ${poppedDownCategory.includes(category) ? "open" : "" }`} fontSize="large" 
                              sx={{transition: "transform 160ms ease", transform: poppedDownCategory.includes(category) ? "rotate(180deg)" : "rotate(0deg"}}/>
                          </button>
                          <h2 className="category-name">{category}</h2> 
                          </div>

                          
                      </div>
                      <div className={`popped-down ${poppedDownCategory.includes(category) ? "active" : ""}`}>
                        <div className="popped-down-inner">
                          <ul className="all-fridge-items">
                            {foodsByCategory[category].length == 0 ? (
                               <li key="no-ingredients" className="fridge-item">
                                  <p>No ingredients</p>
                              </li>
                            ) :
                            (foodsByCategory[category].map((item => (
                               <div key={item.name} className="inner-regular-item">
                                <li className="fridge-item">
                                  <p>{item.name} : {item.measurement} {item.measurementClassification} </p> 
                                  
                                </li>
                                <div className="fridge-item-right-item">
                                  <button className="remove-from-fridge"  onClick={() => handleDeleteFood(item.name)}><RemoveCircleIcon className="delete-icon"></RemoveCircleIcon></button>
                                </div>
                              </div>

                            ))))
                            }
                          </ul>

                        </div>
                         
                      </div>
                    
                  </div>
              ))}

        </section>
         </section>
       </main>
     )
   }
   