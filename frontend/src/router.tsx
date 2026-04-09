import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { PlaceholderPage } from './pages/PlaceholderPage.tsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/starter',
    element: <App />,
  },
  {
    path: '/login',
    element: <PlaceholderPage title="Login" />,
  },
  {
    path: '/signup',
    element: <PlaceholderPage title="Sign Up" />,
  },
  {
    path: '/dashboard',
    element: <PlaceholderPage title="Dashboard" />,
  },
  {
    path: '/fridge',
    element: <PlaceholderPage title="Fridge" />,
  },
  {
    path: '/calorie-tracking',
    element: <PlaceholderPage title="Calorie Tracking" />,
  },
  {
    path: '/recipes',
    element: <PlaceholderPage title="Recipes" />,
  },
  {
    path: '/account',
    element: <PlaceholderPage title="Account" />,
  },
  {
    path: '/nearby-stores',
    element: <PlaceholderPage title="Nearby Stores" />,
  },
  {
    path: '*',
    element: (
      <PlaceholderPage
        title="Page Not Found"
        description="This route has not been scaffolded yet."
      />
    ),
  },
])
