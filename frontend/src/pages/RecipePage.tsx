import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './RecipePage.css'
import SearchIcon from '@mui/icons-material/Search'
import AddCircleIcon from '@mui/icons-material/AddCircle';

export function RecipePage(){

 const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > 900
  })

  const recommended_recipes = [
    {"title": "Sourdough", "id": 1, "img": "https://caputoflour.com/cdn/shop/articles/Artisan_Sourdough_-_Stock_72dpi_0cca10f5-f4c2-458c-9b29-d88175c4b073_1024x1024.jpg?v=1775145833"},
    {"title": "Pizza", "id": 1},
    {"title": "Hamburger", "id": 1},
    {"title": "Red Velvet Cake", "id": 1},
    {"title": "Banana Bread", "id": 1},
    {"title": "Cinnamon Rolls", "id": 1},
        {"title": "Red Velvet Cakessss", "id": 1},
    {"title": "Banana Bread", "id": 1},
    {"title": "Cinnamon Rolls", "id": 1},
    
  ]

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
            <h1>Recipes</h1>
          </div>

 
        </header>
          
          <section>
            
            <form action="" className="search-form">
                <SearchIcon className="search-icon"></SearchIcon>
                <input aria-label="search-box" type="search" placeholder="Search" className="search-bar" />
            </form>

          </section>
          <section className="recommended-recipes">
            <div className="recommended-heading"><h2>Recommended</h2></div>
              
              <div className="recipe-row">
                {recommended_recipes.map((recipe) => (
                  <div className="recipe-card">
                    <Link className="recipe-link" to={`/recipes/${recipe.id}`}>
                     <div className="recipe-content">
                      <div className="recipe-content__heading">
                        <h3>{recipe.title}</h3>
                      </div>
                      
                      <img className="recipe-img" src={recipe.img} alt="" />
                    </div>
                    
                    </Link>
                   

                  </div>
                  ))}

              </div>
          </section>
           <section className="your-recipes">
            <div className="your-recipes-heading">
              <h2>Your Recipes</h2>
              <Link className="add-recipe-link" to="/recipes/create">Add Recipe <AddCircleIcon/></Link>
            </div>
              <div className="recipe-row">
                {recommended_recipes.map((recipe) => (
                  <div className="recipe-card">
                    <div className="recipe-content">
                      <div className="recipe-content__heading">
                        <h3>{recipe.title}</h3>
                      </div>
                    </div>
                    

                  </div>
                  ))}

              </div>
          </section>

          
                     

         </section>
       </main>
     )
   }
   