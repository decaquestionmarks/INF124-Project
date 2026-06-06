import { useEffect, useState} from 'react'
import { Sidebar } from '../components/Sidebar.tsx'
import { SearchFood} from '../components/SearchFood.tsx'
import './DashboardPage.css'
import './CreateRecipePage.css'
import { useNavigate } from 'react-router-dom'
import {toast} from 'react-hot-toast'
import { SecondaryHeader } from '../components/Header.tsx'
import { authFetch } from '../api.ts'

type Ingredient = {
  "name": string;
  "measurement": number;
  "measurementClassification": string;
  "classification": string;
  "caloriesPerMeasurement": number;
}


export function CreateRecipePage(){


  const navigate = useNavigate();
  const [recipeTitle, setRecipeTitle] = useState("My Recipe")

	const [addedIngredients, setAddedIngredients] = useState<Ingredient[]>([])
  const [recipeDescription, setRecipeDescription] = useState("")
  const [steps, setSteps] = useState("")


  // connect later
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
	    try{
	      const body =  JSON.stringify({
	            name: recipeTitle,
	            description: recipeDescription,
	            foods: addedIngredients,
	            steps: steps.split("\n")
	            .map(s=> s.trim())
	            .filter(Boolean)
	          })
      const response = await authFetch('/recipes', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json'
        },
        body:
          body
      })
	      if (!response.ok){
	        throw new Error("Failed to create recipe")
	      }
	      const createdRecipe = await response.json()
	      toast.success(`Added ${recipeTitle} to recipes`)
	      navigate(`/recipes/${createdRecipe._id}`)
	    }
	    catch (error){
	      console.error("ERROR CreatingRecipePage", error)
	      toast.error("Failed to create recipe. Please try again")
	    }
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
          <SecondaryHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} pageTitle="New Recipe" linkBack="/recipes"></SecondaryHeader>
          <form onSubmit={handleSave} className="create-recipe-form">
            <section className="recipe-title">
                  <h2 id="recipe-title-heading">Recipe Title</h2>
                    <input aria-labelledby="recipe-title-heading" id="recipe-title" value={recipeTitle} placeholder='Chicken Alfredo' onChange={(e) => (setRecipeTitle(e.target.value))}/>
            </section>
            <section className="recipe-description">
              <h2 id="recipe-description-heading">Recipe Description</h2>
              <textarea aria-labelledby="recipe-description-heading" id="recipe-description" value={recipeDescription} placeholder='Alfredo pasta topped with grilled chicken' onChange={(e) => (setRecipeDescription(e.target.value))}/>
            </section>

            <SearchFood addedIngredients={addedIngredients} setAddedIngredients={setAddedIngredients}></SearchFood>

          <section className="recipe-steps">
            <h2 id="steps-heading">Steps</h2>
            <textarea className="recipe-steps-text" aria-labelledby='steps-heading' onChange={(e) => setSteps(e.target.value)} placeholder="1. Mix dry ingredients..." name="" id="recipe-steps"></textarea>
          </section>

          <button type="submit" className={`${steps.length == 0 || recipeTitle.length == 0 ? "disabled-button" : "save-recipe"}`} id="save-recipe" disabled={steps.length == 0 || recipeTitle.length == 0} >Save</button>
        </form>
        </section>

       </main>
     )
   }

