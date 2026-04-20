import { Sidebar } from '../components/Sidebar.tsx'
import './AccountPage.css'
import { useEffect, useState } from 'react'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const userData = [
    { id: "starting-weight", label: "Starting Weight:", type: "text", value:145},
    { id: "current-weight", label: "Current Weight:", type: "text", value:150},
    { id: "goal-weight", label: "Goal Weight:", type: "text", value:160 },
    { id: "age", label: "Age:", type: "text", value:22 },
    { id: "height", label: "Height:", type: "text", value:"5'" },
    { id: "activity-level", label: "Activity Level:", type: "select", options: ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"]}
];

const familyData = [
    {username: "Jane Doe", pfp: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"},
    {username : "John Doe", pfp: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"},
]

export function AccountPage(){
    const [editingGoals, setEditingGoals] = useState(false);
    const [editingFamily, setEditingFamily] = useState(false);

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
        <header className="dashboard-page__header">
          <div className="dashboard-page__header-copy">
            <button
              type="button"
              className="dashboard-page__menu-button"
              onClick={() => setIsSidebarOpen((open) => !open)}
              aria-expanded={isSidebarOpen}
              aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <span aria-hidden="true">{isSidebarOpen ? 'Hide' : 'Menu'}</span>
            </button>

            <p className="dashboard-page__eyebrow">Family Fridge</p>
            <h1>Account</h1>
          </div>

 
        </header>
            <section className="account-page__user-goals-content">
              <div className="account-page__section-header">
                <h2>Goals</h2>
                <button onClick={() => (
                  setEditingGoals(!editingGoals))}>{editingGoals ? "Cancel" : "Edit"}</button>
              </div>
                
                <form action="" className="account-page__user-goals-form">
                    <div className="account-page__user-goals-form__grid">
                        { userData.map((data) => (
                            <div className="single-line__user-goals">
                                <label htmlFor={data.id}>{data.label}</label> 
                                {data.type == "text" ? <input id={data.id} className={`goal-input`} type="text" disabled={!editingGoals} value={data.value}/> :
                                    <select name={data.label} className={`goal-input`} disabled={!editingGoals}>
                                    {data.options?.map((option) => (
                                        <option value={option}>{option}</option>
                                    ))}
                                    </select>
                                }
                            </div>
                                
                        ))}
                        
                        

                    </div>
                    <div className={`update-buttons ${!editingGoals ? '' : 'edit'}`}>
                          <button className={`account-page-submit-form`} type="submit" disabled={!editingGoals}>Save</button>    
                    </div>
                      
                </form>
            
            </section>

            <section className="account-page-family-content">
               <div className="account-page__section-header">
                <h2>Family</h2>
                <button onClick={() => (setEditingFamily(!editingFamily))}>{editingFamily ? "Cancel" : "Edit"}</button>
              </div>

                <div className="family-data">
                    {familyData.map((data) => (
                        <div className="family-member">
                          <div className="icon-name-family-member">
                              <AccountCircleIcon aria-label="profile picture" className="pfp-icon" fontSize="large"/>
                              <span>{data.username}</span>
                          </div>
                          <button onClick={() => confirm("Are you sure you want to remove this user?")} className={`remove-user ${editingFamily ? 'edit' : ''}`}>{editingFamily ? 'Remove User' : ''}</button>
                        </div>
                       
                    ))}
                    <div className={`add-family-member ${editingFamily ? 'hidden' : ''}`}>
                       
                        <AddCircleIcon className="plus-icon" fontSize="large"/>
                        <button className="add-user">Add Family Member</button>
                   
                    </div>
                </div>
            </section>
            
        </section>   
      
    </main>
  )
}