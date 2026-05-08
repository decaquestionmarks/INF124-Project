import { useEffect, useState } from 'react'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './CalorieTrackingPage.css'
import SearchIcon from '@mui/icons-material/Search'
import { SecondaryHeader } from '../components/Header.tsx'
import './SearchFoodPage.css'
import { Link, useNavigate } from 'react-router-dom'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';



const search_results = [
  { id:1, title: "Flour", amount: "200", unit: "g", calories: "728" },
  { id: 2, title: "Egg", amount: "50", unit: "g", calories: "78" },
  { id: 3,title: "Whole Milk", amount: "240", unit: "ml", calories: "150" },
  { id: 4, title: "Butter", amount: "14", unit: "g", calories: "102" },
  { id: 5, title: "Sugar", amount: "100", unit: "g", calories: "387" },
  { id:6, title: "Olive Oil", amount: "15", unit: "ml", calories: "119" },
  { id: 7, title: "Banana", amount: "118", unit: "g", calories: "105" },
  { id: 8, title: "Chicken Breast", amount: "100", unit: "g", calories: "165" },
  { id:9, title: "Rice (Cooked)", amount: "150", unit: "g", calories: "195" },
  { id: 10, title: "Spinach", amount: "30", unit: "g", calories: "7" }
];

type SearchFoodProps = {
    linkBack: string
}

export function SearchFoodPage({linkBack}: SearchFoodProps){
  const navigate = useNavigate()
  const handleSave = () => (
    navigate(linkBack)
  )
  const [addedItems, setAddedItems] = useState<string[]>([])
  const selectItem = (title: string) => {
    setAddedItems((prev) => 
      prev.includes(title) ? prev.filter((item) => item != title)
    : [...prev, title]
    );
  };
 const [userInput, setUserInput] = useState("")
 const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("make call", userInput)
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
  
  const [poppedDownIngredient, setPoppedDownIngredient] = useState(0)
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
            <SecondaryHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} pageTitle={"Food Finder"} linkBack={linkBack}></SecondaryHeader>
            <section>

                
                <form action="" onSubmit={handleSubmitSearch} className="search-form">
                    <SearchIcon aria-hidden="true" className="search-icon"></SearchIcon>
                    <input id="search-bar-input" value={userInput} onChange={(e) => setUserInput(e.target.value)} aria-label="Search Foods" type="search" placeholder="Search Foods" className="search-bar" />
                </form>

              </section>
              <section className="search-results">
                {/* <table> */}
                {search_results.map((result) => (                  
                  <div  onClick={() => selectItem(result.title)} key={result.id} className="search-item">
                    <div className={`search-item-heading ${addedItems.includes(result.title) ? "added" : ""}`}>
                      
                      <span>{result.title}</span>
                    <div className="amount-and-unit">
                      <span>{result.amount}</span>
                      <span>{result.unit}</span>
                    </div>
                    
                    <span> {result.calories} cal</span>
                    <button aria-label="Add item" className="add-icon"  
                      id=""
                      onClick={(e) => {
                        e.stopPropagation(); 
                        selectItem(result.title);
                        }}>
                      {addedItems.includes(result.title) ?
                        (<RemoveCircleIcon aria-hidden="true" fontSize='medium'/>) : 
                        (<AddCircleIcon aria-hidden="true" fontSize='medium'/>)
                      }

                      
                      </button>
                    
                    </div>
                  </div>
                ))}
                {/* </table> */}

           
              </section>


              <div className="save-bar">
                <button onClick={handleSave} className="save-button">Add</button>
              </div>
    


         </section>

         
       </main>
     )
   }
   