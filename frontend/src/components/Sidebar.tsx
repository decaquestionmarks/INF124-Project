import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import KeyboardDoubleArrowLeftRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowLeftRounded'
import KeyboardDoubleArrowRightRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowRightRounded'
import KitchenRoundedIcon from '@mui/icons-material/KitchenRounded'
import LocalDiningRoundedIcon from '@mui/icons-material/LocalDiningRounded'
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded'
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded'
import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const navigationItems = [
  { label: 'Dashboard', path: '/dashboard', icon: DashboardRoundedIcon },
  { label: 'Fridge', path: '/fridge', icon: KitchenRoundedIcon },
  {
    label: 'Calorie Tracker',
    path: '/calorie-tracking',
    icon: MonitorWeightRoundedIcon,
  },
  { label: 'Recipes', path: '/recipes', icon: LocalDiningRoundedIcon },
  { label: 'Nearby Stores', path: '/nearby-stores', icon: StorefrontRoundedIcon },
]

type SidebarProps = {
  brand?: string
  isOpen: boolean
  onToggle: () => void
}

export function Sidebar({
  brand = 'NAME',
  isOpen,
  onToggle,
}: SidebarProps) {
  const ToggleIcon = isOpen
    ? KeyboardDoubleArrowLeftRoundedIcon
    : KeyboardDoubleArrowRightRoundedIcon

  return (
    <aside
      className={`app-sidebar${isOpen ? ' app-sidebar--open' : ' app-sidebar--closed'}`}
      aria-label="Primary"
    >
      <div className="app-sidebar__topbar">
        <div className="app-sidebar__brand" aria-label={brand}>
          <span className="app-sidebar__brand-full">{brand}</span>
          <span className="app-sidebar__brand-compact">
            {brand.slice(0, 2).toUpperCase()}
          </span>
        </div>

        <button
          type="button"
          className="app-sidebar__toggle"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <ToggleIcon fontSize="small" aria-hidden="true" />
        </button>
      </div>

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
