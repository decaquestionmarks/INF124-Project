import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './FridgePage.css'
import AddCircleIcon from '@mui/icons-material/AddCircle';
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


export function FridgePage(){

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
    const [poppedDownCategory, setPoppedDownCategory] = useState<number[]>([]);

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
        <Header setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} pageTitle="Fridge"></Header>

        <section className="food-items">
            <div className="add-food-options">
                <button className="add-option">Scan Receipt <AddCircleIcon aria-hidden="true"></AddCircleIcon></button>
                <Link className="add-option" to="/fridge/search-food">Add to Fridge <AddCircleIcon aria-hidden="true"></AddCircleIcon></Link>
                <Link className="add-list-item" to="/fridge/search-food">Add to List <AddCircleIcon aria-hidden="true"></AddCircleIcon></Link>
            </div>
              {categories.map((category) => (
                  <div key={category.id} className="category">
                      <div className={`food-item-heading ${poppedDownCategory.includes(category.id) ? "active" : ""}`}>
                          <div className="left-items">
                          <button onClick={() => setPoppedDownCategory(
                              poppedDownCategory.includes(category.id) ? poppedDownCategory.filter(item => item != category.id) : [...poppedDownCategory,  category.id])}>
                              <KeyboardArrowDownRoundedIcon aria-label="Expand" className={`down-icon ${poppedDownCategory.includes(category.id) ? "open" : "" }`} fontSize="large" 
                              sx={{transition: "transform 160ms ease", transform: poppedDownCategory.includes(category.id) ? "rotate(180deg)" : "rotate(0deg"}}/>
                              
                          </button>
                          <h2 className="category-name">{category.name}</h2> 
                          </div>
                          <div className="shopping-cart-notify">
                            <ShoppingCartIcon/> {needed_items.filter((item) => item.category == category.name).length}
                          </div>
                          
                      </div>
                      <div className={`popped-down ${poppedDownCategory.includes(category.id) ? "active" : ""}`}>
                        <div className="popped-down-inner">
                          <ul className="all-fridge-items">
                           <li className="fridge-item">
                              Mock item - 2 units
                            </li>
                          {needed_items
                            .filter (item => item.category === category.name)
                            .map((item) => (
                              <li key={item.id} className="needed-item">
                                <div className="inner-needed-item">
                                  <p>{item.title} : {item.quantity} {item.unit} </p>
                                  <p>Added by {item.added_by}</p>
                                </div>
                              </li>
                            ))}
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
   