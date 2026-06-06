import { Sidebar } from '../components/Sidebar.tsx'
import './AccountPage.css'
import { useEffect, useState } from 'react'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Header } from '../components/Header.tsx';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { authFetch } from '../api.ts';

// const initialData = {
//   weightStarting: '',
//   weightCurrent: '',
//   weightGoal: '',
//   age: '',
//   activityLevel: '',
//   "height-ft": '',
//   "height-in": '',
// }

type FamilyMember = {
  id: string;
  name: string;
  isDefault?: boolean;
}

export function AccountPage(){
 

  // const handleSaveGoals =  (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault()
  //   setOriginalFormValues(formValues)
  //   setEditingGoals(false)
  //   // updating username/email?
  //   }

  // const formSchema = [
  //     {
  //       id: "calorie-goal:",
  //       label: "Calorie Goal:",
  //       type: "number"
  //     },
  // ]
    // const [formValues, setFormValues] = useState<Record<string, string>>(initialData)
    // const [originalFormValues, setOriginalFormValues] = useState<Record<string, string>>(initialData)
    // const [editingGoals, setEditingGoals] = useState(false);
    const [editingFamily, setEditingFamily] = useState(false);
    const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
    const [newFamilyMemberName, setNewFamilyMemberName] = useState("")
    const [familyError, setFamilyError] = useState("")

  // TODO: connect these to backend
    useEffect(() => {
    // getting the users account details
        const fetchAccount = async () => {
           const res = await authFetch(`/users/me/account`)
           await res.json()
         // fetch account data
        }
        fetchAccount()
  }, [])


  useEffect(() => {
        const fetchFamily = async () => {
          try {
            const res = await authFetch('/users/me/family')
            const data = await res.json()

            if (!res.ok) {
              throw new Error(data.error || "Unable to load family members")
            }

            setFamilyMembers(Array.isArray(data.members) ? data.members : [])
            setFamilyError("")
          } catch (error) {
            console.error("Error loading family members: ", error)
            setFamilyError("Unable to load family members.")
          }
        }
        fetchFamily()
  }, [])

  const handleInviteUser = async () => {
    const name = newFamilyMemberName.trim()
    if (!name) return

    try {
      const res = await authFetch('/users/me/family', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Unable to add family member")
      }

      if (Array.isArray(data.members)) {
        setFamilyMembers(data.members)
      } else if (data.member) {
        setFamilyMembers((members) => [...members, data.member])
      }

      setNewFamilyMemberName("")
      setFamilyError("")
      setEditingFamily(false)
    } catch (error) {
      console.error("Error adding family member: ", error)
      setFamilyError(error instanceof Error ? error.message : "Unable to add family member.")
    }
  }

  const handleRemoveUser = async (memberId: string) => {
    try {
      const res = await authFetch(`/users/me/family/${encodeURIComponent(memberId)}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Unable to remove family member")
      }

      setFamilyMembers(Array.isArray(data.members) ? data.members : [])
      setFamilyError("")
    } catch (error) {
      console.error("Error removing family member: ", error)
      setFamilyError(error instanceof Error ? error.message : "Unable to remove family member.")
    }
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

      // const formChanges = JSON.stringify(formValues) != JSON.stringify(originalFormValues)

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
            {/* <section className="account-page__user-goals-content">
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
            
            </section> */}

            <section className="account-page-family-content">
               <div className="account-page__section-header">
                <h2>Family</h2>
                <button className="edit-button" aria-label={editingFamily ? "Cancel editing family" : "Edit family"} onClick={() => (setEditingFamily(!editingFamily))}>{editingFamily ? "Cancel" : "Edit"}</button>
              </div>

                <div className="family-data">
                    {familyError ? <p className="family-error">{familyError}</p> : null}
                    {familyMembers.map((member) => (
                        <div key={member.id} className="family-member">
                          <div className="icon-name-family-member">
                              <AccountCircleIcon aria-hidden="true" className="pfp-icon" fontSize="large"/>
                              <span>{member.name}{member.isDefault ? " (You)" : ""}</span>
                          </div>
                          {member.isDefault ? (
                            <span className={`remove-user ${editingFamily ? 'edit' : ''}`}>{editingFamily ? 'Account owner' : ''}</span>
                          ) : (
                            <button aria-label={`Remove ${member.name}`} className={`remove-user ${editingFamily ? 'edit' : ''}`} onClick={() => handleRemoveUser(member.id)}>{editingFamily ? 'Remove' : ''}</button>
                          )}
                        </div>
                       
                    ))}
                    <div className={`add-family-member ${editingFamily ? 'hidden' : ''}`}>
                      <input
                        id="family-member-name"
                        type="text"
                        placeholder="Family member name"
                        value={newFamilyMemberName}
                        onChange={(event) => setNewFamilyMemberName(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault()
                            handleInviteUser()
                          }
                        }}
                      />
                       <button aria-label="Add family member" className="add-user" onClick={handleInviteUser}>
                        Add Member
                        <AddCircleIcon className="plus-icon" fontSize="medium"/>
                            
                        </button>
                   
                    </div>
                </div>
            </section>
            
            
        </section>   
      
    </main>
  )
}
