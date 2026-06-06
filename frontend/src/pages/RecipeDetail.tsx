import { useEffect, useState } from 'react'
import {useNavigate, useParams } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './RecipeDetail.css'
import { SecondaryHeader } from '../components/Header.tsx'
import {SharingComponent} from '../components/SharingComponent.tsx'
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { SearchFood } from '../components/SearchFood.tsx'
import { apiFetch, authFetch } from '../api.ts'
import { useAuth } from '../auth/AuthContext.tsx'
import {toast} from 'react-hot-toast'


type Ingredient = {
  "name": string;
  "measurement": number;
  "measurementClassification": string;
  "classification": string;
  "caloriesPerMeasurement": number;
}



export function RecipeDetail(){
      const {id} = useParams();
	      const [editMode, setIsEditing] = useState(false)
	      const [title, setTitle] = useState("")
	      const [description, setDescription] = useState("")
	      const [ownerId, setOwnerId] = useState<string | null>(null)
	      const [steps, setSteps] = useState<string[]>([])
	      const [ingredients, setIngredients] = useState<Ingredient[]>([])

	      const [ogTitle, setOgTitle] = useState("")
	      const [ogDescription, setOgDescription] = useState("")
	      const [ogSteps, setOgSteps] = useState<string[]>([])
	      const [ogIngredients, setOgIngredients] = useState<Ingredient[]>([])
	      const navigate = useNavigate()
	      const { user } = useAuth()
	      const canMutateRecipe = Boolean(user && ownerId && user.uid === ownerId)

	      const handleCancelUpdate = (async () => {
	          setTitle(ogTitle)
	          setDescription(ogDescription)
	          setSteps(ogSteps)
	          setIngredients(ogIngredients)
	          setStepsDraft(ogSteps.join("\n"))
	          setIsEditing(false)
	      })

      const handleSaveUpdate = (async () => {
      try{
        if (!id){return}
              const nextSteps = stepsDraft
                .split('\n')
                .map((step) => step.trim())
                .filter(Boolean)
	              const response = await authFetch(`/recipes/${encodeURIComponent(id)}`, {
	                method: 'PUT',
	                headers: {
	                  'Content-type': 'application/json',
	                },
	                body: JSON.stringify({
	                  name: title,
	                  description,
	                  foods: ingredients,
	                  steps: nextSteps,
	                  }),
	              });
	              const updatedRecipe = await response.json()

	              if (!response.ok) {
	                throw new Error(updatedRecipe.error || "Failed to update recipe")
	              }

	             setTitle(updatedRecipe.name)
	             setDescription(updatedRecipe.description ?? "")
	             setSteps(Array.isArray(updatedRecipe.steps) ? updatedRecipe.steps : nextSteps)
	             setIngredients(Array.isArray(updatedRecipe.foods) ? updatedRecipe.foods : ingredients)
	             setOgTitle(updatedRecipe.name)
	             setOgDescription(updatedRecipe.description ?? "")
	             setOgSteps(Array.isArray(updatedRecipe.steps) ? updatedRecipe.steps : nextSteps)
	             setOgIngredients(Array.isArray(updatedRecipe.foods) ? updatedRecipe.foods : ingredients)
	             setIsEditing(false)
	             toast.success("Updated recipe")
	            }
	            catch (error) {
	              console.error("ERROR RecipeDetail Fetch", error)
	              toast.error(error instanceof Error ? error.message : "Failed to update recipe")
	            }
	      });

      const handleDelete = (async () => {
          try{
            if (!id){return}
	                const response = await authFetch(`/recipes/${encodeURIComponent(id)}`, {method: 'DELETE'} )
	                const data = await response.json()

	                if (!response.ok) {
	                  throw new Error(data.error || "Failed to delete recipe")
	                }

	                toast.success("Deleted recipe")
	                navigate('/recipes')
	          }
	          catch (error) {
	            console.error("ERROR RecipeDetail Fetch", error)
	            toast.error(error instanceof Error ? error.message : "Failed to delete recipe")
	          }

	          })

	          const startEdit = (() => {
	              if (!canMutateRecipe) return;
	              setIsEditing(true)
	              setStepsDraft(steps.join("\n"));
	            }
	          )

 const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > 900
  })


  const [stepsDraft, setStepsDraft] = useState("");
  useEffect(() => {
      async function fetchData(){
        if (!id) return;
        try{
	            const response = await apiFetch(`/recipes/${encodeURIComponent(id)}`)
	            const data = await response.json()
	            if (!response.ok) {
	              throw new Error(data.error || "Recipe not found")
	            }
	            setOgTitle(data.name ?? "")
	            setOgDescription(data.description ?? "")
	            setOgSteps(Array.isArray(data.steps) ? data.steps : [])
	            setOgIngredients(Array.isArray(data.foods) ? data.foods : [])

	            setTitle(data.name ?? "")
	            setDescription(data.description ?? "")
	            setOwnerId(typeof data.ownerId === "string" ? data.ownerId : null)
	            setSteps(Array.isArray(data.steps) ? data.steps : [])
	            setIngredients(Array.isArray(data.foods) ? data.foods : [])
          }
          catch (error) {
            console.error("ERROR RecipeDetail Fetch", error)
          }
    }
    fetchData()
  }, [id])


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
            <SecondaryHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} pageTitle={title ? title : ""} linkBack="/recipes"></SecondaryHeader>
	            <div className="selection-items">
	            {canMutateRecipe ? <div className="edit-or-delete">
	              <button type="button" className="recipe-icon-button" aria-label="Edit recipe" onClick={startEdit}><EditRoundedIcon className="edit"></EditRoundedIcon></button>
	              <button type="button" className="recipe-icon-button" aria-label="Delete recipe" onClick={handleDelete}><DeleteRoundedIcon className="delete"></DeleteRoundedIcon></button>
	             </div> : <div />}
	              <SharingComponent recipeId={id}></SharingComponent>
	            </div>

	            <section className="recipe-detail-summary">
	              {editMode ? (
	                <>
	                  <label htmlFor="recipe-detail-title">Title</label>
	                  <input
	                    id="recipe-detail-title"
	                    className="recipe-detail-input"
	                    value={title}
	                    onChange={(event) => setTitle(event.target.value)}
	                  />
	                  <label htmlFor="recipe-detail-description">Description</label>
	                  <textarea
	                    id="recipe-detail-description"
	                    className="recipe-detail-textarea"
	                    value={description}
	                    onChange={(event) => setDescription(event.target.value)}
	                  />
	                </>
	              ) : description ? (
	                <p>{description}</p>
	              ) : null}
	            </section>

	            <section className="ingredients-section">
                {editMode ? (<SearchFood addedIngredients={ingredients} setAddedIngredients={setIngredients}></SearchFood>) :
                <div className="detail-item">
                <h2 id="recipe-detail-ingredients-heading">Ingredients</h2>
                <div className="ingredients-text">

                  {ingredients.length == 0 ? <p>No ingredients added</p> : ingredients.map((f, i) => (
                    // TODO: remove conditional in production
                    <div key={i} className="ingredient-item">
                      <div className="tracked-ingredient-item">
                        <p>{f.name} - {f.measurement} {f.measurementClassification}</p>
                        {/* <p className="missing-item">Missing Item!</p> */}
                      </div>


                    </div>
                  ))
                 }
                  </div>
                </div>
                }
            </section>
            <section className="direction-section">
                <h2 id="directions-heading">Directions</h2>
                <div className="steps-text">
                  {editMode ? (
                    <textarea
                      value={stepsDraft}
                      onChange={(e) => setStepsDraft(e.target.value)}

                    ></textarea>)
                    :
                   steps.length != 0 ?( steps.map((s) => (

                      (<p key={s}>{s}</p>)
                  ))) :

                 ( <p>1. Mock Step</p>)
                  }
                </div>

            </section>
            <div className="editor-actions">
              <div className="right-items-editor-actions">
                <button onClick={handleCancelUpdate} className={editMode ? "cancel-button" : "hidden-button"}>Cancel</button>
                <button onClick={handleSaveUpdate} className={editMode ? "save-button" : "hidden-button"}>Save</button>
              </div>
            </div>
         </section>
       </main>
     )
   }

