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
      const [steps, setSteps] = useState<string[]>([])
      const [ingredients, setIngredients] = useState<Ingredient[]>([])

      const [ogSteps, setOgSteps] = useState<string[]>([])
      const [ogIngredients, setOgIngredients] = useState<Ingredient[]>([])
      const navigate = useNavigate()
      
      const handleCancelUpdate = (async () => {
          setSteps(ogSteps)
          setIngredients(ogIngredients)
          setIsEditing(false)
      })
  
      const handleSaveUpdate = (async () => {
      try{
        if (!id){return}
            // route missing a function
              const end_url = `http://127.0.0.1:3000/recipes/${encodeURIComponent(id)}`
              const response = await fetch(end_url, {
                method: 'PUT',
                headers: {
                  'Content-type': 'application/json',
                },
                body: JSON.stringify({
                  name: title,
                  foods: ingredients,
                  steps: steps,
                  }),
              });

              console.log("PUT RESPONSE: ", response)
              
             setIsEditing(false)
            }
            catch (error) {
              console.error("ERROR RecipeDetail Fetch", error)
            } 
      });

        const handleDelete = (async () => {
            try{
              if (!id){return}
                  const end_url = `http://127.0.0.1:3000/recipes/${id}`
                  const response = await fetch(end_url, {method: 'DELETE'} )
                  console.log("RESPONSE WHEN DELETING RECIPE: ", response)
                  // deleteRecipe function not implemented in backend
                 
                  
            }
            catch (error) {
              console.error("ERROR RecipeDetail Fetch", error)
            } 
            finally {
              navigate('/recipes')
            }
            
          })

          const startEdit = (() => {
              setIsEditing(true)
              setStepsDraft(steps.join("\n"));
              setIsEditing(true);}
          ) 

 const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > 900
  })


 

  // const stepsText = steps.join("\n");
  const [stepsDraft, setStepsDraft] = useState("");

  // const [addedIngredients, setAddedIngredients] = useState<Ingredient[]>([])

//  starting to connect to backend
  useEffect(() => {
      async function fetchData(){
        if (!id) return;
        try{
            const end_url = `http://127.0.0.1:3000/recipes/${encodeURIComponent(id)}`
            const response = await fetch(end_url)
            const data = await response.json()
            setOgSteps(Array.isArray(data.steps) ? data.steps : [])
            setOgIngredients(Array.isArray(data.foods) ? data.foods : [])

            setTitle(data.name)
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
            <SecondaryHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} pageTitle={title ? title : "Mock Title"} linkBack="/recipes"></SecondaryHeader>
            <div className="selection-items">
            <div className="edit-or-delete">
              <EditRoundedIcon className="edit" onClick={startEdit}></EditRoundedIcon>
              <DeleteRoundedIcon className="delete" onClick={handleDelete}></DeleteRoundedIcon>
             </div>
              <SharingComponent recipeId={id}></SharingComponent>
            </div>
             
            
            <section className="ingredients-section">
                {editMode ? (<SearchFood addedIngredients={ingredients} setAddedIngredients={setIngredients}></SearchFood>) : 
                <div className="detail-item">
                <h2 id="recipe-detail-ingredients-heading">Ingredients</h2>
                <div className="ingredients-text">
                  {ingredients.length != 0 ? ingredients.map((f, i) => (
                    <div key={i} className="ingredient-item">
                      <div className="tracked-ingredient-item">
                        <p>{f.name} - {f.measurement} {f.measurementClassification}</p>
                        {/* <p className="missing-item">Missing Item!</p> */}
                      </div>
                      
                    
                    </div>
                    
                  )) :  
                   <div className="ingredient-item">
                      <p>Mock Ingredient - 1 unit</p>
                      <p className="missing-item">Missing Item!</p>
                    </div>
                    
                  
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
   