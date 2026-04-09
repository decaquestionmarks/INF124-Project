import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Sidebar } from '../components/Sidebar.tsx'
import './DashboardPage.css'

const overviewCards = [
  {
    title: 'Fridge',
    description: 'See what the family has on hand and stay ahead of the next grocery run.',
    path: '/fridge',
  },
  {
    title: 'Calorie Tracking',
    description: 'Check daily progress, meal history, and quick nutrition updates in one place.',
    path: '/calorie-tracking',
  },
  {
    title: 'Recipes',
    description: 'Jump back into saved favorites or find tonight’s next meal idea.',
    path: '/recipes',
  },
  {
    title: 'Nearby Stores',
    description: 'Look up nearby options before heading out for a refill.',
    path: '/nearby-stores',
  },
]

const activityItems = [
  {
    label: 'Fridge Update',
    detail: 'Add new grocery items or scan a receipt when a restock lands.',
  },
  {
    label: 'Family Goals',
    detail: 'Review calorie targets and keep everyone aligned on the week ahead.',
  },
  {
    label: 'Recipe Planning',
    detail: 'Build a quick shortlist for dinner ideas using what is already at home.',
  },
]

export function DashboardPage() {
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
            <h1>Dashboard</h1>
            <p className="dashboard-page__intro">
              Keep the household organized with quick access to inventory,
              recipes, calorie tracking, and nearby stores.
            </p>
          </div>

          <Link className="dashboard-page__action" to="/fridge">
            Open Fridge
          </Link>
        </header>

        <section className="dashboard-page__grid" aria-label="Dashboard overview">
          {overviewCards.map((card) => (
            <article key={card.title} className="dashboard-page__card">
              <div>
                <h2>{card.title}</h2>
                <p>{card.description}</p>
              </div>

              <Link className="dashboard-page__card-link" to={card.path}>
                View Section
              </Link>
            </article>
          ))}
        </section>

        <section className="dashboard-page__panel" aria-labelledby="dashboard-activity">
          <div className="dashboard-page__panel-header">
            <h2 id="dashboard-activity">Household Snapshot</h2>
            <Link className="dashboard-page__panel-link" to="/recipes">
              Explore Recipes
            </Link>
          </div>

          <div className="dashboard-page__activity-list">
            {activityItems.map((item) => (
              <article key={item.label} className="dashboard-page__activity-item">
                <h3>{item.label}</h3>
                <p>{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}
