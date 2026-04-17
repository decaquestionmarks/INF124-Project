import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { FirebaseError } from 'firebase/app'
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { Sidebar } from '../components/Sidebar.tsx'
import { auth, googleProvider } from '../firebase.ts'
import './LoginPage.css'

function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.'
  }

  switch (error.code) {
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Incorrect email or password.'
    case 'auth/popup-closed-by-user':
      return 'Google sign-in was cancelled.'
    default:
      return 'Unable to sign in right now. Please try again.'
  }
}

export function LoginPage() {
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

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  const handleEmailPasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError(null)
    setIsSubmitting(true)

    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setAuthError(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = async () => {
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
      className={`login-page${isSidebarOpen ? ' login-page--sidebar-open' : ' login-page--sidebar-closed'}`}
    >
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((open) => !open)}
      />

      <div
        className={`login-page__backdrop${isSidebarOpen ? ' login-page__backdrop--visible' : ''}`}
        aria-hidden="true"
        onClick={() => setIsSidebarOpen(false)}
      />

      <section className="login-page__content">
        <div className="login-page__form-container">
          <button
            type="button"
            className="login-page__menu-button"
            onClick={() => setIsSidebarOpen((open) => !open)}
            aria-expanded={isSidebarOpen}
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <span aria-hidden="true">{isSidebarOpen ? 'Hide' : 'Menu'}</span>
          </button>
          
          <h1 className="login-page__title">Log in</h1>
          
          <form className="login-page__form" onSubmit={handleEmailPasswordLogin}>
            <div className="login-page__input-group">
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
            
            <div className="login-page__input-group">
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

            {authError ? <p className="login-page__error">{authError}</p> : null}
            
            <button type="submit" className="login-page__submit" disabled={isSubmitting}>
              Log in
            </button>

            <button
              type="button"
              className="login-page__google"
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
            >
              Continue with Google
            </button>
          </form>
          
          <p className="login-page__footer">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
