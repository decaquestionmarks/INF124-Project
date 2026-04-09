import { Link, useLocation } from 'react-router-dom'

type PlaceholderPageProps = {
  title: string
  description?: string
}

const scaffoldedRoutes = [
  { label: 'Login', path: '/login' },
  { label: 'Sign Up', path: '/signup' },
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Fridge', path: '/fridge' },
  { label: 'Calorie Tracker', path: '/calorie-tracking' },
  { label: 'Recipes', path: '/recipes' },
  { label: 'Account', path: '/account' },
  { label: 'Vite Starter', path: '/starter' },
]

export function PlaceholderPage({
  title,
  description = 'This route is scaffolded and ready for implementation.',
}: PlaceholderPageProps) {
  const location = useLocation()

  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        lineHeight: 1.5,
        margin: '0 auto',
        maxWidth: '48rem',
        padding: '2rem',
      }}
    >
      <h1>{title}</h1>
      <p>{description}</p>
      <p>
        Current path: <code>{location.pathname}</code>
      </p>

      <nav aria-label="Scaffolded routes">
        <h2>Available Routes</h2>
        <ul>
          {scaffoldedRoutes.map((route) => (
            <li key={route.path}>
              <Link to={route.path}>{route.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  )
}
