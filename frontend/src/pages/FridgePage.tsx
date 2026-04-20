import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './FridgePage.css'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

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
          <header className="dashboard-page__header">
          <div className="dashboard-page__header-copy">
            <button
              type="button"
              className="dashboard-page__menu-button"
              onClick={() => setIsSidebarOpen((open) => !open)}
              aria-expanded={isSidebarOpen}
              aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <span aria-hidden="true">{isSidebarOpen ? 'Hide' : 'Menu'}</span>
            </button>

            <p className="dashboard-page__eyebrow">Family Fridge</p>
            <h1>Fridge</h1>
          </div> 
        </header>

        <section className="food-items">
            <div className="add-food-options">
                <button className="add-option">Scan Receipt <AddCircleIcon></AddCircleIcon></button>
                <button className="add-option">Add Item <AddCircleIcon></AddCircleIcon></button>
            </div>
            {categories.map((category) => (
                <div className="category">
                    <div className={`food-item-heading ${poppedDownCategory.includes(category.id) ? "active" : ""}`}>
                        <span className="category-name">{category.name}</span> 
                        <button onClick={() => setPoppedDownCategory(
                            poppedDownCategory.includes(category.id) ? poppedDownCategory.filter(item => item != category.id) : [...poppedDownCategory,  category.id])}>
                            {poppedDownCategory.includes(category.id) ? 
                            <ArrowDropDownIcon className="down-icon" fontSize="large"/> :
                            <ArrowDropUpIcon className="down-icon" fontSize="large"/>}
                        </button>
                    </div>
                    <div className={`popped-down ${poppedDownCategory.includes(category.id) ? "active" : ""}`}>
                        <div className="food-item">Tomatoes</div>
                        <div className="food-item">Asparagus</div>
                    </div>
                   
                </div>
             ))}
            

        </section>
          


         </section>
       </main>
     )
   }
   