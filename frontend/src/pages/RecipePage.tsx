import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './RecipePage.css'
import SearchIcon from '@mui/icons-material/Search'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {Header} from '../components/Header.tsx'
// type Recipe = {
//   id: number;
//   name: string;
//   description?: string;
//   foods?: any[];
//   steps?: any[];
// }

type RecipePreview = {
  id: number;
  name: string;
  image?: string;
  time?: string;
}

export function RecipePage(){

 const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > 900
  })
    // MOCK recipes until API
  const recommended_recipes = [
    {"title": "Sourdough", "id": 1, "img": "https://caputoflour.com/cdn/shop/articles/Artisan_Sourdough_-_Stock_72dpi_0cca10f5-f4c2-458c-9b29-d88175c4b073_1024x1024.jpg?v=1775145833"},
    {"title": "Pizza", "id": 2},
    {"title": "Hamburger", "id": 3},
    {"title": "Red Velvet Cake", "id": 4},
    {"title": "Banana Bread", "id": 5},
    {"title": "Cinnamon Rolls", "id": 6},
        {"title": "Chicken Alfredo", "id": 7},
    {"title": "Banana Bread", "id": 8},
    {"title": "Cinnamon Rolls", "id": 9},
    
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

    const [searchMode, setSearchMode] = useState(false)
    const [input, setInput] = useState("")
    // const [searchedRecipes, setSearchedRecipes] = useState<Recipe[]>([])
    const [previews, setPreviews] = useState<RecipePreview[]>([])
   
    //  starting to connect to backend
    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
          try{
            const end_url = `http://127.0.0.1:3000/recipes/search?query=${encodeURIComponent(input)}`
            console.log(end_url)
            const response = await fetch(end_url)
            const data = await response.json()
            
            console.log("DATA", data)
            const results = data.results
            // setSearchedRecipes(results)
            setSearchMode(true)

            const previewsArr = []
            for (const r of results){
                const resp = await fetch(`http://127.0.0.1:3000/recipes/${r.id}/preview`);
  
                const preview = await resp.json();
                previewsArr.push(preview)
                console.log(preview.image)
            }
  
            
            setPreviews(previewsArr)
          
            
          }
          catch (error) {
            console.error("ERROR", error)
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
        <Header isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} pageTitle={"Recipes"}></Header>
          
          <section>
            
            <form action="" className="search-form" onSubmit={handleSearch}>
            {/* <form action="" className="search-form"  onSubmit={(e) => (e.preventDefault())}> */}
                <label htmlFor="search-bar-input" className="search-label">Search Food</label>
                <SearchIcon aria-hidden="true" className="search-icon"></SearchIcon>
                <input id="search-bar-input" aria-label="Search Recipes" type="search" placeholder="Search Recipes" 
                onChange={(e) => {
                  const value = e.target.value
                  setInput(value);
                  if (value.trim() == ""){
                    setSearchMode(false)}
                }} className="search-bar"
                autoComplete="off"
                 />
            </form>

          </section>
          {!searchMode &&
              <div className="default-recipe-section">
                <section className="recommended-recipes">
                  <div className="recommended-heading"><h2>Recommended</h2></div>
                    
                    <div className="recipe-row">
                      {recommended_recipes.map((recipe) => (
                        <div key={recipe.id} className="recipe-card">
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
                    <Link className="add-recipe-link" to="/recipes/create">Add Recipe <AddCircleIcon aria-hidden="true"/></Link>
                  </div>
                    <div className="recipe-row">
                      {recommended_recipes.map((recipe) => (
                        <div key={recipe.id} className="recipe-card">
                          <div className="recipe-content">
                            <div className="recipe-content__heading">
                              <h3>{recipe.title}</h3>
                            </div>
                          </div>
                          

                        </div>
                        ))}

                    </div>
                </section>
              </div>
            }
          {searchMode &&
          <div>
            <section className="search-results">
              <div className="search-rows">
                {previews.length != 0 ? previews.map((recipe) => (
                  <Link key={recipe.id} className="recipe-link" to={`/recipes/${recipe.id}`}>
                    <div className="recipe-card">
                        <div className="recipe-content">
                          <div className="recipe-content__heading">
                            <h3>{recipe.name}</h3>
                          </div>
                          <img src={recipe.image} alt="" />
                        </div>
                    </div>
                  </Link> 
                 

              ))
              :
                  <div className="no-results"><p>No results found</p></div>
            }

              </div>
              

            </section>
          </div>
          }
          </section>
       </main>
     )
   }
   