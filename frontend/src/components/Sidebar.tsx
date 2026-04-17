import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded'
import KitchenRoundedIcon from '@mui/icons-material/KitchenRounded'
import LocalDiningRoundedIcon from '@mui/icons-material/LocalDiningRounded'
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { signOut } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext.tsx'
import { auth } from '../firebase.ts'
import './Sidebar.css'

type NavigationItem = {
  label: string
  path: string
  icon: typeof DashboardRoundedIcon
}

/**
 * Sidebar navigation configuration.
 *
 * Each entry controls:
 * - The visible label in the sidebar.
 * - The destination route used by NavLink.
 * - The Material UI icon rendered for that route.
 */
const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardRoundedIcon },
  { label: 'Fridge', path: '/fridge', icon: KitchenRoundedIcon },
  {
    label: 'Calorie Tracker',
    path: '/calorie-tracking',
    icon: MonitorWeightRoundedIcon,
  },
  { label: 'Recipes', path: '/recipes', icon: LocalDiningRoundedIcon },
]

const accountNavigationItem: NavigationItem = {
  label: 'Account',
  path: '/account',
  icon: AccountCircleIcon,
}

/**
 * Props for the Sidebar component.
 */
type SidebarProps = {
  /** Brand name shown at the top left of the sidebar. */
  brand?: string
  /** Controls whether the sidebar is expanded or collapsed. */
  isOpen: boolean
  /** Triggered when the user clicks the collapse/expand button. */
  onToggle: () => void
}

/**
 * Primary application sidebar.
 *
 * Responsibilities:
 * - Render brand and collapse toggle controls.
 * - Render main route navigation links.
 * - Expose ARIA labels and expanded state for accessibility.
 */
export function Sidebar({
  brand = 'Foodly',
  isOpen,
  onToggle,
}: SidebarProps) {
  const { user } = useAuth()
  const location = useLocation()
  const [isAccountSubmenuOpen, setIsAccountSubmenuOpen] = useState(() => {
    return ['/login', '/signup', '/account'].includes(location.pathname)
  })

  // Remove the useEffect that closes the submenu right when sidebar collapses
  // to avoid triggering a vertical shrink animation while the sidebar width shrinks horizontally.

  useEffect(() => {
    if (isOpen && ['/login', '/signup', '/account'].includes(location.pathname)) {
      setIsAccountSubmenuOpen(true)
    }
  }, [location.pathname, isOpen])

  const handleLogout = async () => {
    await signOut(auth)
  }

  return (
    <aside
      className={`app-sidebar${isOpen ? ' app-sidebar--open' : ' app-sidebar--closed'}`}
      aria-label="Primary"
    >
      {/* Top row with brand and sidebar toggle button. */}
      <div className="app-sidebar__topbar">
        <div className="app-sidebar__brand" aria-label={brand}>
          <span className="app-sidebar__brand-full">{brand}</span>
        </div>

        <button
          type="button"
          className="app-sidebar__toggle"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <KeyboardDoubleArrowLeftRoundedIcon
            className="app-sidebar__toggle-icon"
            fontSize="small"
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Main app navigation links. */}
      <nav className="app-sidebar__nav" aria-label="Main navigation">
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              aria-label={item.label}
              className={({ isActive }) =>
                `app-sidebar__link${isActive ? ' app-sidebar__link--active' : ''}`
              }
            >
              <span className="app-sidebar__link-icon" aria-hidden="true">
                <Icon fontSize="small" />
              </span>
              <span className="app-sidebar__link-text">{item.label}</span>
            </NavLink>
          )
        })}

        <div
          className={`app-sidebar__submenu${isAccountSubmenuOpen ? ' app-sidebar__submenu--open' : ''}`}
        >
          <button
            type="button"
            className="app-sidebar__link app-sidebar__submenu-toggle"
            onClick={() => setIsAccountSubmenuOpen((open) => !open)}
            aria-expanded={isAccountSubmenuOpen}
            aria-controls="account-submenu"
            aria-label={accountNavigationItem.label}
          >
            <span className="app-sidebar__link-icon" aria-hidden="true">
              <AccountCircleIcon fontSize="small" />
            </span>
            <span className="app-sidebar__link-text">{accountNavigationItem.label}</span>
            <span className="app-sidebar__submenu-chevron" aria-hidden="true">
              <ExpandMoreRoundedIcon fontSize="small" />
            </span>
          </button>

          <div id="account-submenu" className="app-sidebar__submenu-panel">
            {user ? (
              <>
                <NavLink
                  to={accountNavigationItem.path}
                  className={({ isActive }) =>
                    `app-sidebar__sublink${isActive ? ' app-sidebar__sublink--active' : ''}`
                  }
                >
                  Account settings
                </NavLink>
                <button
                  type="button"
                  className="app-sidebar__sublink app-sidebar__sublink-button"
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  `app-sidebar__sublink${isActive || location.pathname === '/signup' ? ' app-sidebar__sublink--active' : ''}`
                }
              >
                Log In/Sign up
              </NavLink>
            )}
          </div>
        </div>
      </nav>
    </aside>
  )
}
