import { Sidebar } from '../components/Sidebar.tsx'
import './AccountPage.css'
import { useEffect, useState } from 'react'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { Header } from '../components/Header.tsx';



const familyData = [
    {username: "Jane Doe", pfp: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"},
    {username : "John Doe", pfp: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg"},
]


export function AccountPage(){
  const formSchema = [
      {
        id: "weightStarting",
        label: "Starting Weight:",
        type: "number"
      },
      {
        id: "weightCurrent",
        label: "Current Weight:",
        type: "number"
      },
      {
        id: "weightGoal",
        label: "Goal Weight:",
        type: "number"
      },
      {
        id: "age",
        label: "Age:",
        type: "number"
      },


      {
        id: "activityLevel",
        label: "Activity:",
        type: "select",
      },
      {
        id: "height",
        label: "Height:",
        type: "group",
      },
  ]
    const [formValues, setFormValues] = useState<Record<string, string>>({})
    const [originalFormValues, setOriginalFormValues] = useState(formValues)
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

      const formChanges = JSON.stringify(formValues) !== JSON.stringify(originalFormValues)


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
      
        <Header setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} pageTitle={"Account"}></Header>
            <section className="account-page__user-goals-content">
              <div className="account-page__section-header">
                <h2>Goals</h2>
                <button onClick={() => (
                  setEditingGoals(!editingGoals))}>{editingGoals ? "Cancel" : "Edit"}</button>
              </div>
                
                <form autoComplete="off" action="" className="account-page__user-goals-form">
                    <div className="account-page__user-goals-form__grid">
                      {formSchema.map((field) => {
                        if (field.type == "select"){
                          return (
                            <div className="activity-grouping">
                                <label htmlFor="">{field.label}</label>
                                <select name="activity-level" className={`goal-input`} disabled={!editingGoals} value={formValues[field.id]}
                                  onChange={(e) => setFormValues((prev) => ({...prev,  [field.id]: e.target.value}))}>
                                  <option value="sedentary">Sedentary</option>
                                  <option value="lightly-active">Lightly Active</option>
                                  <option value="moderately-active">Moderately Active</option>
                                  <option value="very-active">Very Active</option>

                                </select>
                              </div>
                            )

                        }
                        if (field.type == "group"){
                          return (
                              <div className="height-grouping">
                                  <label htmlFor="">{field.label}</label>
                                    <div className="height-inputs">
                                      <input min="0" type="number" id="height-ft" onWheel={(e) => {e.currentTarget.blur()}} 
                                        value={formValues["height-ft"]}
                                        onChange={(e) => setFormValues(prev => ({
                                              ...prev, 
                                              ["height-ft"]: e.target.value}))} disabled={!editingGoals} 
                                              />
                                              <span>ft</span>
                                      <input min="0" type="number" id="height-inches" onChange={(e) => setFormValues(prev => ({
                                            ...prev, 
                                            ["height-in"]: e.target.value}))} disabled={!editingGoals} onWheel={(e) => {e.currentTarget.blur()}}
                                            value={formValues["height-in"]}
                                            />
                                            <span>in</span>
                                    </div>
                                  
                                </div>

                                )
                        }
                        return (
                        <div className="single-line__user-goals">
                          <label htmlFor={field.id}>{field.label}</label> 
                            <input id={field.id} type={field.type} value={formValues[field.id]} onChange={(e) => setFormValues((prev) => ({
                                ...prev, 
                                [field.id]: e.target.value}))} disabled={!editingGoals}
                                onWheel={(e) => {e.currentTarget.blur()}}/>
                        </div>
                        )
                        
                      })}
                    </div>
                    <div className={`update-buttons ${!editingGoals ? '' : 'edit'}`}>
                          <button className={`${formChanges ? "account-page-submit-form" : "disabled-account-page-submit-form"}`} type="submit" disabled={!editingGoals || !formChanges}>Save</button>    
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
                          <button className={`remove-user ${editingFamily ? 'edit' : ''}`}>{editingFamily ? 'Remove User' : ''}</button>
                        </div>
                       
                    ))}
                    <div className={`add-family-member ${editingFamily ? 'hidden' : ''}`}>
                       
                        <AddCircleIcon className="plus-icon" fontSize="large"/>
                        <button className="add-user">Add User</button>
                   
                    </div>
                </div>
            </section>
            
        </section>   
      
    </main>
  )
}