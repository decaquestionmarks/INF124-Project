import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { FirebaseError } from 'firebase/app'
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth'
import { Sidebar } from '../components/Sidebar.tsx'
import { auth, googleProvider } from '../firebase.ts'
import './SignupPage.css'

function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.'
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/popup-closed-by-user':
      return 'Google sign-up was cancelled.'
    default:
      return 'Unable to create your account right now. Please try again.'
  }
}

export function SignupPage() {
  const navigate = useNavigate()
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

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const handleEmailPasswordSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError(null)
    setIsSubmitting(true)

    try {
      const credentials = await createUserWithEmailAndPassword(auth, email, password)

      if (name.trim()) {
        await updateProfile(credentials.user, { displayName: name.trim() })
      }

      navigate('/dashboard', { replace: true })
    } catch (error) {
      setAuthError(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignup = async () => {
    setAuthError(null)
    setIsSubmitting(true)

    try {
      await signInWithPopup(auth, googleProvider)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setAuthError(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main
      className={`signup-page${isSidebarOpen ? ' signup-page--sidebar-open' : ' signup-page--sidebar-closed'}`}
    >
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((open) => !open)}
      />

      <div
        className={`signup-page__backdrop${isSidebarOpen ? ' signup-page__backdrop--visible' : ''}`}
        aria-hidden="true"
        onClick={() => setIsSidebarOpen(false)}
      />

      <section className="signup-page__content">
        <div className="signup-page__form-container">
          <button
            type="button"
            className="signup-page__menu-button"
            onClick={() => setIsSidebarOpen((open) => !open)}
            aria-expanded={isSidebarOpen}
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span aria-hidden="true">{isSidebarOpen ? 'Hide' : 'Menu'}</span>
          </button>
          
          <h1 className="signup-page__title">Sign up</h1>
          
          <form className="signup-page__form" onSubmit={handleEmailPasswordSignup}>
            <div className="signup-page__input-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="signup-page__input-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            
            <div className="signup-page__input-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {authError ? <p className="signup-page__error">{authError}</p> : null}
            
            <button type="submit" className="signup-page__submit" disabled={isSubmitting}>
              Sign up
            </button>

            <button
              type="button"
              className="signup-page__google"
              onClick={handleGoogleSignup}
              disabled={isSubmitting}
            >
              Continue with Google
            </button>
          </form>
          
          <p className="signup-page__footer">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
