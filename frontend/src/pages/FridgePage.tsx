import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './FridgePage.css'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { Header } from '../components/Header.tsx'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const needed_items = [
  {
    id: 1,
    title: "Milk",
    quantity: 1,
    unit: "gallon",
    category: "Dairy",
    added_by: "user",
  },
  {
    id: 2,
    title: "Bananas",
    quantity: 6,
    unit: "pcs",
    category: "Produce",
    added_by: "user",
  },
  {
    id: 3,
    title: "Apples",
    quantity: 2,
    unit: "pcs",
    category: "Produce",
    added_by: "user",
  },
  {
    id: 4,
    title: "Chicken Breast",
    quantity: 2,
    unit: "lbs",
    category: "Meat",
    added_by: "user",
  },
  {
    id: 5,
    title: "Bread",
    quantity: 1,
    unit: "loaf",
    category: "Bakery",
    added_by: "user",
  },
  {
    id: 6,
    title: "Olive Oil",
    quantity: 1,
    unit: "bottle",
    category: "Pantry",
    added_by: "user",
  }
];
const mock_items = [
  {
    id: 101,
    title: "Eggs",
    quantity: 12,
    unit: "pcs",
    category: "Dairy",
    added_by: "Mom",
  },
  {
    id: 102,
    title: "Spinach",
    quantity: 1,
    unit: "bag",
    category: "Produce",
    added_by: "Dad",
  },
  {
    id: 103,
    title: "Carrots",
    quantity: 5,
    unit: "pcs",
    category: "Produce",
    added_by: "You",
  },
  {
    id: 104,
    title: "Ground Beef",
    quantity: 1,
    unit: "lb",
    category: "Meat",
    added_by: "Mom",
  },
];

 const categories = [
        {"name": "Produce", "id": 1},
        {"name": "Dairy", "id": 2},
        {"name": "Meat", "id": 3},
        {"name": "Bakery", "id": 4},
        {"name": "Pantry", "id": 5},
        {"name": "Frozen", "id": 6},
        {"name": "Drinks", "id": 7},
        {"name": "Snacks", "id": 8},
        {"name": "Condiments", "id": 9},
        {"name": "Spices and Baking", "id": 10},
    ]

type Item = {
      id: number,
      title: string,
      quantity: number, 
      unit: string,
      category: string,
      added_by: string

    }

function getAssociatedItems(item_list: Item[]){
  // useMemo caches results, on rerender if all dependencies same skips calculation
  {return useMemo(() => {
  const mapping: Record<string, Item[]> = {};

    categories.forEach(c => {
      mapping[c.name] = [];
    });

    item_list.forEach(item => {
      if (mapping[item.category]) {
        mapping[item.category].push(item);
      }
    });

    return mapping;
  }, [item_list, categories]);
}


}

export function FridgePage(){

  const [poppedDownCategory, setPoppedDownCategory] = useState<number[]>([]);

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

  const neededItemsInCategory = getAssociatedItems(needed_items);
  const regularItemsInCategory = getAssociatedItems(mock_items)
   
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

                    <Link className="dropdown-option" to="/fridge/search-food?mode=shopping-list">
                      Add to Shopping List <AddCircleIcon aria-hidden="true" />
                    </Link>
                  </div>
                </div>
            </div>

              
            </div>
              {categories.map((category) => (
                  <div key={category.id} className="category">
                      <div className={`food-item-heading ${poppedDownCategory.includes(category.id) ? "active" : ""}`}
                       onClick={(e) => {e.stopPropagation; setPoppedDownCategory(
                              poppedDownCategory.includes(category.id) ? poppedDownCategory.filter(item => item != category.id) : [...poppedDownCategory,  category.id])}}>
                          <div className="left-items">
                          <button aria-label="Expand" onClick={(e) => {e.stopPropagation; setPoppedDownCategory(
                              poppedDownCategory.includes(category.id) ? poppedDownCategory.filter(item => item != category.id) : [...poppedDownCategory,  category.id])}}>
                              <KeyboardArrowDownRoundedIcon className={`down-icon ${poppedDownCategory.includes(category.id) ? "open" : "" }`} fontSize="large" 
                              sx={{transition: "transform 160ms ease", transform: poppedDownCategory.includes(category.id) ? "rotate(180deg)" : "rotate(0deg"}}/>
                          </button>
                          <h2 className="category-name">{category.name}</h2> 
                          </div>
                         
                         { neededItemsInCategory[category.name].length != 0 && <div className="shopping-cart-notify">
                            <ShoppingCartIcon/> {neededItemsInCategory[category.name].length}
                          </div>}
                          
                      </div>
                      <div className={`popped-down ${poppedDownCategory.includes(category.id) ? "active" : ""}`}>
                        <div className="popped-down-inner">
                          <ul className="all-fridge-items">
                          {(regularItemsInCategory[category.name].map((item) => (
                             <div key={item.id} className="inner-regular-item">

                             
                              <li className="fridge-item">
                                <p>{item.title} : {item.quantity} {item.unit} </p>
                                
                              </li>
                              <button className="remove-from-fridge" onClick={(e) => {
                                      e.stopPropagation();
                                      // make API CALL to delete
                                    }}><RemoveCircleIcon></RemoveCircleIcon></button>
                            </div>
                          )))}
                           { (neededItemsInCategory[category.name].map(item => (
                              <li key={item.id} className="needed-item">
                                <div className="inner-needed-item">
                                  
                                  <p>{item.title} : {item.quantity} {item.unit} </p>
                                  {/* <p>Added by {item.added_by}</p> */}
                                  <button className="add-item-from-list-to-fridge" onClick={(e) => {
                                    e.stopPropagation();
                                    // make API CALL to delete
                                  }}><AddCircleIcon></AddCircleIcon></button>
                                </div>
                              </li>
                            )))}
                            {regularItemsInCategory[category.name].length == 0 && neededItemsInCategory[category.name].length == 0 && (
                               <li className="fridge-item">
                                  <p>No ingredients</p>

                              </li>
                            )}
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
   