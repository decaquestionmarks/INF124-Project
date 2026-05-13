import { useEffect, useState } from 'react'
import {useParams } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './RecipeDetail.css'
import { SecondaryHeader } from '../components/Header.tsx'

type Ingredient = {
  name: string;
  classification: string
  measurementClassification: string
  measurement: string
}

export function RecipeDetail(){

 const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > 900
  })

  const {id} = useParams();

  const [title, setTitle] = useState("")
  const [steps, setSteps] = useState<string[]>([])
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
//  starting to connect to backend
  useEffect(() => {
      async function fetchData(){
        if (!id) return;
        try{
            const end_url = `http://127.0.0.1:3000/recipes/${encodeURIComponent(id)}`
            const response = await fetch(end_url)
            const data = await response.json()
            setTitle(data.name)
            setSteps(data.steps)
            setIngredients(data.foods)
  

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
            <section className="ingredients-section">
                <h2>Ingredients</h2>
                <div className="ingredients-text">
                  {ingredients.length != 0 ? ingredients.map((f, i) => (
                    <div key={i} className="ingredient-item">
                      <p>{f.name} - {f.measurement} {f.measurementClassification}</p>
                      <p className="missing-item">Missing Item!</p>
                    </div>
                    
                  )) :  
                   <div className="ingredient-item">
                      <p>Mock Ingredient - 1 unit</p>
                      <p className="missing-item">Missing Item!</p>
                    </div>
                    
                  
                 }
                </div>
            </section>
            <section className="direction-section">
                <h2>Directions</h2>
                <div className="steps-text">
                   {steps.length != 0 ? steps.map((s) => (
                    <p key={s}>{s}</p>
                  )) : 
                  
                  <p>1. Mock Step</p>}
                </div>
            </section>
         </section>
       </main>
     )
   }
   