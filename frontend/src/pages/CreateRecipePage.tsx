import { useEffect, useState} from 'react'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './CreateRecipePage.css'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SearchIcon from '@mui/icons-material/Search'
import { useNavigate } from 'react-router-dom'
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import { SecondaryHeader } from '../components/Header.tsx'

type Ingredient = {
  "id": number;
  "title": string;
  "amount": number;
  "unit": string;
  "caloriesPerUnit": number;
}


export function CreateRecipePage(){
  // temp stuff
   const fillerIngredients = [
    {"id": 1, "title": "Yeast", "amount": 25, "unit": "g", "caloriesPerUnit": 4},
    {"id": 2, "title": "Bread Flour", "amount": 300, "unit": "g", "caloriesPerUnit": 4},
    {"id": 3, "title": "Water", "amount": 1.5, "unit": "cup(s)", "caloriesPerUnit": 0},
    
  ]

  const navigate = useNavigate();
  // connect later
  const handleSave = () => {
    navigate("/recipes")
  }
 
  const [recipeTitle, setRecipeTitle] = useState("My Recipe")
  const [searchInput, setSearchInput] = useState('')
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([])

  const [addedIngredients, setAddedIngredients] = useState<Ingredient[]>([])
  const [poppedDownIngredient, setPoppedDownIngredient] = useState(0)

  const [steps, setSteps] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const input = e.target.value;
      setSearchInput(input);

      // temp
      const matchedIngredients = fillerIngredients.filter((ingredient) => (
        ingredient.title.toLowerCase().includes(input.toLowerCase()) && input.length != 0
      ))

      setFilteredIngredients(matchedIngredients);


    }

    const handleAddIngredient = (ingredients: Ingredient) => (
      setAddedIngredients((prev) => 
        prev.some((item) => item.id == ingredients.id)
      ? prev.filter((item) => item.id !== ingredients.id )
      : [...prev, ingredients]
        // [...addedIngredients, ingredients])
    ))


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
          
          <section className="recipe-title">
                <h2 id="recipe-title-heading">Recipe Title</h2>
                  <input aria-labelledby="recipe-title-heading" id="recipe-title" value={recipeTitle} placeholder='Chicken Alfredo' onChange={(e) => (setRecipeTitle(e.target.value))}/>
          </section>
          <section className="ingredients">
            <div className="ingredients-header">
              <h2 id="ingredients-heading">Ingredients</h2>
            </div>
              
              <ul className={`list-of-ingredients ${addedIngredients.length != 0 ? "active" : ""}`}>
                  {addedIngredients.map((ingredients) => (
                  <li  key={ingredients.id}>
                    <div className="listed-item" >
                      <span>{ingredients.title} : </span>
                      <div className="input-amount-and-unit">
                      <input
                          id="ingredient-amount"
                          placeholder="1"
                          type="number"
                          onChange={(e) => {
                            const value = Number(e.target.value)

                            setAddedIngredients((prev) =>
                              prev.map((i) =>
                                i.id === ingredients.id
                                  ? { ...i, amount: value }
                                  : i
                              )
                            )
                          }}
                        />
                        

                        <span>{ingredients.unit}</span>
                        </div>
                        <span className="calculated-calories">{ingredients.amount * ingredients.caloriesPerUnit} cals</span>
                      </div>
                  </li>))}
              </ul>
            
          <section>
          
          </section>
              <div className="search-area">
                  <div className="search-form">
                      <SearchIcon aria-hidden="true" className="search-icon"></SearchIcon>
                      <input onChange={handleInputChange} aria-label="Search for ingredients" type="search" placeholder="Search for Ingredients" className="search-bar" />
                  </div>
                  <div className={`matched-items ${filteredIngredients.length != 0  || searchInput != "" ? "active" : ""}`} aria-live="polite">
                      {filteredIngredients.length == 0 && searchInput != "" ?
                      <p>No ingredients found</p> 
                      : filteredIngredients.map((ingredient) => (
                        <div onClick={() => handleAddIngredient(ingredient)} key={ingredient.id} className={`whole-item ${addedIngredients.some((i) => (i.title == ingredient.title)) ? "added" : ""}`}>
                        <div className={`item ${poppedDownIngredient == ingredient.id ? "" : "active"}`} >
                          <span>{ingredient.title}</span>
                          <div className="amount-and-unit">
                              <span>{ingredient.caloriesPerUnit} cals / {ingredient.unit}</span>
                          </div>
                          
                            <button aria-label={addedIngredients.some((item)=> item.id === ingredient.id) ? "Remove item" : "Add item"} id="add-ingredient" onClick={(e) => {e.stopPropagation(); handleAddIngredient(ingredient);}} >
                              {addedIngredients.some((item)=> item.id === ingredient.id) ? 
                              
                              <RemoveCircleIcon aria-hidden="true" fontSize='medium'/> : 
                              <AddCircleIcon aria-hidden="true" fontSize='medium'/>  
                            }
                            </button>
                          
                        </div>
                        
                        </div>
                      ))}
                  </div>
                
              </div>
        </section>

        <section className="recipe-steps">
          <h2 id="steps-heading">Steps</h2>
          <textarea aria-labelledby='steps-heading' onChange={(e) => setSteps(e.target.value)} placeholder="1. Mix dry ingredients..." name="" id="recipe-steps"></textarea>
        </section>

        
        <button onClick={handleSave} className={`${addedIngredients.length == 0 && steps.length == 0 ? "disabled-button" : "save-recipe"}`} id="save-recipe" disabled={addedIngredients.length == 0 && steps.length == 0} >Save</button>
        </section>
    
       </main>
     )
   }
   