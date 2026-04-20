import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './CreateRecipePage.css'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import SearchIcon from '@mui/icons-material/Search'
import { useNavigate } from 'react-router-dom'


type Ingredient = {
  "id": number;
  "title": string;
  "amount": number;
  "unit": string;
  "calories": number;
}


export function CreateRecipePage(){
   const fillerIngredients = [
    {"id": 1, "title": "Yeast", "amount": 25, "unit": "g", "calories": 20},
    {"id": 2, "title": "Bread Flour", "amount": 500, "unit": "g", "calories": 1000},
    {"id": 3, "title": "Water", "amount": 1.5, "unit": "cups", "calories": 0},
    
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


  const handleInputChange = (e) => {
      const input = e.target.value;
      setSearchInput(input);


      const filteredIngredients = fillerIngredients.filter((ingredient) => (
        ingredient.title.toLowerCase().includes(input.toLowerCase()) && input.length != 0
      ))
      setFilteredIngredients(filteredIngredients);


    }
    const handleAddIngredient = (ingredients: Ingredient) => (
      setAddedIngredients([...addedIngredients, ingredients])
    )



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
        <header className="recipe-detail-page__header">
            <button
              type="button"
              className="dashboard-page__menu-button"
              onClick={() => setIsSidebarOpen((open) => !open)}
              aria-expanded={isSidebarOpen}
              aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <span aria-hidden="true">{isSidebarOpen ? 'Hide' : 'Menu'}</span>
            </button>
             <div className="back-button">

                <Link to="/recipes" aria-label="Back">
                  <ArrowBackIosIcon className="back-icon"></ArrowBackIosIcon>
                </Link>
               

            </div>
            <div className="recipe-title__container">
              <input autoFocus type="text" value={recipeTitle} onChange={(e) => (setRecipeTitle(e.target.value))}/>
          
            </div>
            
        </header>

        <section className="ingredients">
          <div className="ingredients-header">
            <h2>Ingredients</h2>
            
          </div>
            
            <ul>
                {addedIngredients.map((ingredients) => (
                <li>{ingredients.title} : {ingredients.amount} {ingredients.unit}</li>))}
            </ul>
           
             <section>
          
          </section>
        {/* might make this a component, since we need search functionality for recipes */}
        <div className="search-area">
            <form action="" className="search-form">
                <SearchIcon className="search-icon"></SearchIcon>
              <input onChange={handleInputChange} aria-label="search-box" type="search" placeholder="Search for Ingredients"className="search-bar" />
            </form>
            <div className="matched-items">
                {filteredIngredients.length == 0 && searchInput != "" ?
                <p>No ingredients found</p> : filteredIngredients.map((ingredient) => (
                  <div className="whole-item">
                  <div className={`item ${poppedDownIngredient == ingredient.id ? "" : "active"}`} >
                    <span>{ingredient.title}</span>
                    <div className="amount-and-unit">
                      <span>{ingredient.amount}</span>
                      {/* <input type="text" value={ingredient.amount}/> */}
                      <span>{ingredient.unit}</span>
                    </div>
                    
                    <span> {ingredient.calories} cal</span>
                    <div className="item-buttons">
                      <button onClick={() => (poppedDownIngredient == (ingredient.id) ? setPoppedDownIngredient(0) : setPoppedDownIngredient(ingredient.id))}>Details</button>
                      <button id="add-ingredient" onClick={() => handleAddIngredient(ingredient)} >Add <AddCircleIcon/></button>
                    </div>
                    
                  </div>
                  <div className={`pop-down ${poppedDownIngredient == ingredient.id ? "active" : ""}`}>
                    <span>Carbs: </span>
                      <span>Protein: </span>
                      <span>Fat: </span>
                  </div>
                  </div>
                ))}
            </div>
          
        </div>
     

        </section>


       
        <section className="recipe-steps">
            <h2>Steps</h2>
            <textarea placeholder="1. Mix dry ingredients..." name="" id=""></textarea>
        </section>

        
        <button onClick={handleSave} id="save-recipe">Save Recipe</button>
        </section>
         
        
        
                
       </main>
     )
   }
   