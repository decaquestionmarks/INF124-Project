import { useEffect, useState } from 'react'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'
import './CalorieTrackingPage.css'
import SearchIcon from '@mui/icons-material/Search'
import { SecondaryHeader } from '../components/Header.tsx'
import './SearchFoodPage.css'
import {useLocation, useNavigate } from 'react-router-dom'
import AddCircleIcon from '@mui/icons-material/AddCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';

type SearchFoodProps = {
    linkBack: string
}

type FoodResult = {
  name: string,
  amount: string,
  unit: string,
  calories: string
}



export function SearchFoodPage({linkBack}: SearchFoodProps){
  const [searchResults, setSearchResults] = useState<FoodResult[]>([])
  const navigate = useNavigate()

  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const meal = params.get('meal');
  const date = params.get('date');

  const [addedItems, setAddedItems] = useState<string[]>([])
  const selectItem = (id: string) => {
    setAddedItems((prev) => 
      prev.includes(id) ? prev.filter((item) => item != id)
    : [...prev, id]
    );
  };
 const [userInput, setUserInput] = useState("")


 const handleSubmitSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInput.trim()) return;
    try{
      //make call
      // set search results
      setSearchResults([])

    }
    catch (error){
      console.error("ERROR SearchFoodPage", error)
    }
 }

 const handleSave = async () => {
  // fetch and figure out what to pass
    // const res = fetch(`http://127.0.0.1:3000/users/me/goal/${date}/foods`,
    //   {
    //   method: 'POST',
    //   headers: {'Content-type': 'application/json'},
    //   body: JSON.stringify({
    //       name: name,
    //       meal: meal,
    //   })
    //   }

    // )
    // console.log("SAVING FOOD: ", res)
    navigate(linkBack, 
      {state: {meal, date, selectedFoods: addedItems}})
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
            <SecondaryHeader isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} pageTitle={"Food Finder"} linkBack={linkBack}></SecondaryHeader>
            <section>

                
                <form onSubmit={handleSubmitSearch} className="search-form">
                    <SearchIcon aria-hidden="true" className="search-icon"></SearchIcon>
                    <input id="search-bar-input" value={userInput} onChange={(e) => setUserInput(e.target.value)} aria-label="Search Foods" type="search" placeholder="Search Foods" className="search-bar" autoComplete="off" />
                </form>

              </section>
              <section className="search-results">
                {searchResults.map((result) => (                  
                  <div  onClick={() => selectItem(result.name)} key={result.name} className="search-item">
                    <div className={`search-item-heading ${addedItems.includes(result.name) ? "added" : ""}`}>
                      
                      <span>{result.name}</span>
                    <div className="amount-and-unit">
                      <span>{result.amount}</span>
                      <span>{result.unit}</span>
                    </div>
                    
                    <span> {result.calories} cal</span>
                    <button aria-label="Add item" className="add-icon"  
                      id="add-item-button"
                      onClick={(e) => {
                        e.stopPropagation(); 
                        selectItem(result.name);
                        }}>
                      {addedItems.includes(result.name) ?
                        (<RemoveCircleIcon aria-hidden="true" fontSize='medium'/>) : 
                        (<AddCircleIcon aria-hidden="true" fontSize='medium'/>)
                      }

                      
                      </button>
                    
                    </div>
                  </div>
                ))}

           
              </section>


              <div className="save-bar">
                <button onClick={handleSave} className="save-button">Add</button>
              </div>
    


         </section>

         
       </main>
     )
   }
   