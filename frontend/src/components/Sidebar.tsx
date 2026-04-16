import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded'
import KitchenRoundedIcon from '@mui/icons-material/KitchenRounded'
import LocalDiningRoundedIcon from '@mui/icons-material/LocalDiningRounded'
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { NavLink } from 'react-router-dom'
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
  { label: 'Account', path: '/account', icon: AccountCircleIcon },
]

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
      </nav>
    </aside>
  )
}
