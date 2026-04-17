import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { PlaceholderPage } from './pages/PlaceholderPage.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import {RecipePage} from './pages/RecipePage.tsx'
import { RecipeDetail } from './pages/RecipeDetail.tsx'
import { AccountPage } from './pages/AccountPage.tsx'

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
    element: <DashboardPage />,
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
    element: <RecipePage/>,
  },
    {
    path: '/recipes/:id',
    element: <RecipeDetail/>,
  },
  {
    path: '/account',
    element: <AccountPage/>,
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
