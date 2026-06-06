import { type FormEvent, useEffect, useState } from 'react'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { Sidebar } from '../components/Sidebar.tsx'
import { Header } from '../components/Header.tsx'
import { authFetch } from '../api.ts'
import './AccountPage.css'

const DEFAULT_CALORIE_GOAL = 2000

type FamilyMember = {
  id: string;
  name: string;
  isDefault?: boolean;
  calorieGoal?: number;
}

const calorieFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 })

const getMemberCalorieGoal = (member: FamilyMember) => {
  const calorieGoal = Number(member.calorieGoal)
  return Number.isFinite(calorieGoal) && calorieGoal > 0
    ? Math.round(calorieGoal)
    : DEFAULT_CALORIE_GOAL
}

const buildGoalValues = (members: FamilyMember[]) => {
  return members.reduce<Record<string, string>>((values, member) => {
    values[member.id] = String(getMemberCalorieGoal(member))
    return values
  }, {})
}

export function AccountPage() {
  const [editingFamily, setEditingFamily] = useState(false)
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([])
  const [familyGoalValues, setFamilyGoalValues] = useState<Record<string, string>>({})
  const [newFamilyMemberName, setNewFamilyMemberName] = useState("")
  const [savingMemberId, setSavingMemberId] = useState<string | null>(null)
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [familyError, setFamilyError] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    return window.innerWidth > 900
  })

  useEffect(() => {
    const fetchFamily = async () => {
      try {
        const res = await authFetch('/users/me/family')
        const data = await res.json()

        if (!res.ok) {
          throw new Error(data.error || "Unable to load family members")
        }

        const members = Array.isArray(data.members) ? data.members as FamilyMember[] : []
        setFamilyMembers(members)
        setFamilyGoalValues(buildGoalValues(members))
        setFamilyError("")
      } catch (error) {
        console.error("Error loading family members: ", error)
        setFamilyError("Unable to load family members.")
      }
    }

    fetchFamily()
  }, [])

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

  const resetFamilyGoalInputs = () => {
    setFamilyGoalValues(buildGoalValues(familyMembers))
  }

  const handleToggleEditingFamily = () => {
    if (editingFamily) {
      resetFamilyGoalInputs()
      setNewFamilyMemberName("")
      setFamilyError("")
    }

    setEditingFamily(!editingFamily)
  }

  const handleInviteUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const name = newFamilyMemberName.trim()
    if (!name || isAddingMember) return

    setIsAddingMember(true)
    try {
      const res = await authFetch('/users/me/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Unable to add family member")
      }

      const nextMembers = Array.isArray(data.members)
        ? data.members as FamilyMember[]
        : data.member
          ? [...familyMembers, data.member as FamilyMember]
          : familyMembers

      setFamilyMembers(nextMembers)
      setFamilyGoalValues(buildGoalValues(nextMembers))
      setNewFamilyMemberName("")
      setFamilyError("")
    } catch (error) {
      console.error("Error adding family member: ", error)
      setFamilyError(error instanceof Error ? error.message : "Unable to add family member.")
    } finally {
      setIsAddingMember(false)
    }
  }

  const handleSaveMemberGoal = async (member: FamilyMember) => {
    const goalValue = familyGoalValues[member.id] ?? String(getMemberCalorieGoal(member))
    const calorieGoal = Number(goalValue)

    if (!Number.isFinite(calorieGoal) || calorieGoal <= 0) {
      setFamilyError("Enter a calorie goal greater than 0.")
      return
    }

    setSavingMemberId(member.id)
    try {
      const res = await authFetch(`/users/me/family/${encodeURIComponent(member.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calorieGoal }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Unable to update calorie goal")
      }

      const nextMembers = Array.isArray(data.members)
        ? data.members as FamilyMember[]
        : data.member
          ? familyMembers.map((familyMember) => (
            familyMember.id === data.member.id ? data.member as FamilyMember : familyMember
          ))
          : familyMembers

      setFamilyMembers(nextMembers)
      setFamilyGoalValues(buildGoalValues(nextMembers))
      setFamilyError("")
    } catch (error) {
      console.error("Error updating family member calorie goal: ", error)
      setFamilyError(error instanceof Error ? error.message : "Unable to update calorie goal.")
    } finally {
      setSavingMemberId(null)
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

      const members = Array.isArray(data.members) ? data.members as FamilyMember[] : []
      setFamilyMembers(members)
      setFamilyGoalValues(buildGoalValues(members))
      setFamilyError("")
    } catch (error) {
      console.error("Error removing family member: ", error)
      setFamilyError(error instanceof Error ? error.message : "Unable to remove family member.")
    }
  }

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
        <Header setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} pageTitle={"Account"} />

        <section className="account-page-family-content">
          <div className="account-page__section-header">
            <h2>Family</h2>
            <button
              className="edit-button"
              type="button"
              aria-label={editingFamily ? "Cancel editing family" : "Edit family"}
              onClick={handleToggleEditingFamily}
            >
              {editingFamily ? "Cancel" : "Edit"}
            </button>
          </div>

          <div className="family-data">
            {familyError ? <p className="family-error">{familyError}</p> : null}

            {familyMembers.map((member) => {
              const calorieGoal = getMemberCalorieGoal(member)
              const goalValue = familyGoalValues[member.id] ?? String(calorieGoal)
              const numericGoalValue = Number(goalValue)
              const isGoalValid = Number.isFinite(numericGoalValue) && numericGoalValue > 0
              const goalHasChanged = isGoalValid && Math.round(numericGoalValue) !== calorieGoal
              const canSaveGoal = editingFamily && goalHasChanged && savingMemberId === null

              return (
                <div key={member.id} className="family-member">
                  <div className="family-member__details">
                    <div className="icon-name-family-member">
                      <AccountCircleIcon aria-hidden="true" className="pfp-icon" fontSize="large" />
                      <span>{member.name}{member.isDefault ? " (You)" : ""}</span>
                    </div>

                    <div className="family-member__goal">
                      <label htmlFor={`calorie-goal-${member.id}`}>Daily calorie goal</label>
                      {editingFamily ? (
                        <div className="family-member__goal-edit">
                          <input
                            id={`calorie-goal-${member.id}`}
                            type="number"
                            min="1"
                            step="1"
                            inputMode="numeric"
                            value={goalValue}
                            disabled={savingMemberId !== null}
                            aria-invalid={goalValue.trim() !== "" && !isGoalValid}
                            onChange={(event) => {
                              setFamilyGoalValues((values) => ({
                                ...values,
                                [member.id]: event.target.value,
                              }))
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                event.preventDefault()
                                if (canSaveGoal) {
                                  handleSaveMemberGoal(member)
                                }
                              }
                            }}
                            onWheel={(event) => {
                              event.currentTarget.blur()
                            }}
                          />
                          <span>kcal/day</span>
                        </div>
                      ) : (
                        <span className="family-member__goal-value">
                          {calorieFormatter.format(calorieGoal)} kcal/day
                        </span>
                      )}
                    </div>
                  </div>

                  {editingFamily ? (
                    <div className="family-member__actions">
                      <button
                        className="family-member__save-goal"
                        type="button"
                        disabled={!canSaveGoal}
                        onClick={() => handleSaveMemberGoal(member)}
                      >
                        {savingMemberId === member.id ? "Saving" : "Save"}
                      </button>

                      {member.isDefault ? (
                        <span className="family-member__owner-label">Account owner</span>
                      ) : (
                        <button
                          aria-label={`Remove ${member.name}`}
                          className="remove-user edit"
                          type="button"
                          onClick={() => handleRemoveUser(member.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ) : null}
                </div>
              )
            })}

            <form
              className={`add-family-member${editingFamily ? ' add-family-member--visible' : ''}`}
              onSubmit={handleInviteUser}
              hidden={!editingFamily}
            >
              <input
                id="family-member-name"
                type="text"
                placeholder="Family member name"
                value={newFamilyMemberName}
                disabled={isAddingMember}
                onChange={(event) => setNewFamilyMemberName(event.target.value)}
              />
              <button aria-label="Add family member" className="add-user" type="submit" disabled={isAddingMember}>
                {isAddingMember ? "Adding" : "Add Member"}
                <AddCircleIcon className="plus-icon" fontSize="medium" />
              </button>
            </form>
          </div>
        </section>
      </section>
    </main>
  )
}
