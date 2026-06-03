import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './RecipePage.css'
import SearchIcon from '@mui/icons-material/Search'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import {Header} from '../components/Header.tsx'
import { apiFetch, authFetch } from '../api.ts'
// type Recipe = {
//   id: number;
//   name: string;
//   description?: string;
//   foods?: any[];
//   steps?: any[];
// }

type RecipePreview = {
  id: string;
  name: string;
  description?: string;
  image?: string | null;
  time?: string;
}

function RecipeCard({ recipe }: { recipe: RecipePreview }) {
  return (
    <div className="recipe-card">
      <Link className="recipe-link" to={`/recipes/${recipe.id}`}>
        <div className="recipe-content">
          <div className="recipe-content__heading">
            <h3>{recipe.name}</h3>
          </div>
          {recipe.image ? (
            <img className="recipe-img" src={recipe.image} alt="" />
          ) : (
            <div className="recipe-img-placeholder" aria-hidden="true">
              {recipe.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
      </Link>
    </div>
  )
}

export function RecipePage(){

 const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > 900
  })
    // MOCK recipes until API


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
    const [previews, setPreviews] = useState<RecipePreview[]>([])
    const [recommendedPreviews, setRecommendedPreviews] = useState<RecipePreview[]>([])
    const [yourRecipes, setYourRecipes] = useState<RecipePreview[]>([])

	    useEffect(() => {
	        const getRecipeRows = async () => {
	          try{
	            const [recommendedResponse, yourRecipesResponse] = await Promise.all([
	              authFetch('/recipes/recommended'),
	              authFetch('/recipes/me'),
	            ])
	            const recommendedData = await recommendedResponse.json()
	            const yourRecipesData = await yourRecipesResponse.json()
	            setRecommendedPreviews(Array.isArray(recommendedData.results) ? recommendedData.results : [])
	            setYourRecipes(Array.isArray(yourRecipesData.results) ? yourRecipesData.results : [])
	          }
	          catch (error) {
	            console.error("ERROR", error)
	          }
	        }
	        getRecipeRows();
	    }, [])

    //  starting to connect to backend
    const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
          try{
            const response = await apiFetch(`/recipes/search?query=${encodeURIComponent(input)}`)
            const data = await response.json()

            const results = data.results
            // setSearchedRecipes(results)
            console.log("SEARCHED RECIPES: ", results)
            setSearchMode(true)

	            const previewsArr: RecipePreview[] = []
            for (const r of results){
                const resp = await apiFetch(`/recipes/${r.id}/preview`);

                const preview = await resp.json();
                previewsArr.push(preview)
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
	                      {recommendedPreviews.length !== 0 ? recommendedPreviews.map((recipe) => (
	                        <RecipeCard key={recipe.id} recipe={recipe} />
	                        )) : <p className="empty-recipe-message">No recommendations yet</p>}

                    </div>
                </section>
                <section className="your-recipes">
                  <div className="your-recipes-heading">
                    <h2>Your Recipes</h2>
                    <Link className="add-recipe-link" to="/recipes/create">Add Recipe <AddCircleIcon aria-hidden="true"/></Link>
                  </div>
                    <div className="recipe-row">
	                      {yourRecipes.length !== 0 ? yourRecipes.map((recipe) => (
	                        <RecipeCard key={recipe.id} recipe={recipe} />
	                        )) : <p className="empty-recipe-message">No recipes created yet</p>}

                    </div>
                </section>
              </div>
            }
          {searchMode &&
          <div>
            <section className="search-results">
              <div className="search-rows">
	                {previews.length != 0 ? previews.map((recipe) => (
	                  <RecipeCard key={recipe.id} recipe={recipe} />
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

