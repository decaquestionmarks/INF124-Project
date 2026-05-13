import { Sidebar } from '../components/Sidebar.tsx'
import './AccountPage.css'
import { useEffect, useState } from 'react'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Header } from '../components/Header.tsx';
import AddCircleIcon from '@mui/icons-material/AddCircle';

const initialData = {
  weightStarting: '',
  weightCurrent: '',
  weightGoal: '',
  age: '',
  activityLevel: '',
  "height-ft": '',
  "height-in": '',
}

const familyData = [
    {username: "Jane Doe"},
    {username : "John Doe"},
]


export function AccountPage(){

  const handleSaveGoals =  (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setOriginalFormValues(formValues)
    setEditingGoals(false)
    }

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
    const [formValues, setFormValues] = useState<Record<string, string>>(initialData)
    const [originalFormValues, setOriginalFormValues] = useState<Record<string, string>>(initialData)
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

      const formChanges = JSON.stringify(formValues) != JSON.stringify(originalFormValues)

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
                <button className="edit-button" onClick={() => (
                  setEditingGoals(!editingGoals))}>{editingGoals ? "Cancel" : "Edit"}</button>
              </div>
                
                <form autoComplete="off" onSubmit={handleSaveGoals} className="account-page__user-goals-form">
                    <div className="account-page__user-goals-form__grid">
                      {formSchema.map((field) => {
                        if (field.type == "select"){
                          return (
                            <div key={field.id} className="activity-grouping">
                                <label htmlFor={field.id}>{field.label}</label>
                                <select id={field.id} name="activity-level" className={`goal-input`} disabled={!editingGoals} value={formValues[field.id]}
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
                              <div key={field.id} className="height-grouping">
                                  <label className="height-label" id="height">{field.label}</label>
                                
                                    <div className="height-inputs">
                                      <input min="0" type="number" id="height-ft" onWheel={(e) => {e.currentTarget.blur()}} 
                                        value={formValues["height-ft"]}
                                        onChange={(e) => setFormValues(prev => ({
                                              ...prev, 
                                              ["height-ft"]: e.target.value}))} disabled={!editingGoals} 
                                        aria-describedby='height-ft-unit'
                                              />
                                      <label id="height-ft-unit">ft</label>
                                      <input min="0" type="number" id="height-in" onChange={(e) => setFormValues(prev => ({
                                            ...prev, 
                                            ["height-in"]: e.target.value}))} disabled={!editingGoals} onWheel={(e) => {e.currentTarget.blur()}}
                                            value={formValues["height-in"]}
                                            aria-describedby='height-in-unit'
                                            aria-labelledby="height"
                                            />
                                        <label id="height-in-unit">in</label>
                                    </div>
                                  
                                </div>

                                )
                        }
                        return (
                        <div key={field.id} className="single-line__user-goals">
                          <label htmlFor={field.id}>{field.label}</label> 
                            <input id={field.id} type={field.type} value={formValues[field.id]} 
                            onChange={(e) => setFormValues((prev) => ({
                                ...prev, 
                                [field.id]: e.target.value}))} disabled={!editingGoals}
                                onWheel={(e) => {e.currentTarget.blur()}}/>
                        </div>
                        )
                        
                      })}
                    </div>
                    <div className={`update-buttons ${!editingGoals ? '' : 'edit'}`}>
                          <button aria-label={editingGoals ? "Cancel editing goals" : "Edit goals"} 
                          className={`${formChanges ? "account-page-submit-form" : "disabled-account-page-submit-form"}`} type="submit" disabled={!editingGoals || !formChanges}>Save</button>    
                    </div>
                      
                </form>
            
            </section>

            <section className="account-page-family-content">
               <div className="account-page__section-header">
                <h2>Family</h2>
                <button className="edit-button" aria-label={editingFamily ? "Cancel editing family" : "Edit family"} onClick={() => (setEditingFamily(!editingFamily))}>{editingFamily ? "Cancel" : "Edit"}</button>
              </div>

                <div className="family-data">
                    {familyData.map((data) => (
                        <div key={data.username} className="family-member">
                          <div className="icon-name-family-member">
                              <AccountCircleIcon aria-hidden="true" className="pfp-icon" fontSize="large"/>
                              <span>{data.username}</span>
                          </div>
                          <button aria-label={`Remove ${data.username}`} className={`remove-user ${editingFamily ? 'edit' : ''}`}>{editingFamily ? 'Remove User' : ''}</button>
                        </div>
                       
                    ))}
                    <div className={`add-family-member ${editingFamily ? 'hidden' : ''}`}>
                      <input id="user-email" type="text" placeholder="someone123@gmail.com"/>
                       <button aria-label="Add family member" className="add-user">
                        Invite User
                        <AddCircleIcon className="plus-icon" fontSize="medium"/>
                            
                        </button>
                   
                    </div>
                </div>
            </section>
            
        </section>   
      
    </main>
  )
}