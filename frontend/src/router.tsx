import { Navigate, createBrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { PlaceholderPage } from './pages/PlaceholderPage.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { SignupPage } from './pages/SignupPage.tsx'
import {RecipePage} from './pages/RecipePage.tsx'
import { RecipeDetail } from './pages/RecipeDetail.tsx'
import { AccountPage } from './pages/AccountPage.tsx'
import { RedirectIfAuthenticated, RequireAuth } from './auth/RouteGuards.tsx'
import { CreateRecipePage } from './pages/CreateRecipePage.tsx'
import { FridgePage } from './pages/FridgePage.tsx'

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
    element: (
      <RedirectIfAuthenticated>
        <LoginPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: '/signup',
    element: (
      <RedirectIfAuthenticated>
        <SignupPage />
      </RedirectIfAuthenticated>
    ),
  },
  {
    path: '/dashboard',
    element: (
      <RequireAuth>
        <DashboardPage />
      </RequireAuth>
    ),
  },
  {
    path: '/fridge',
    element: (
      <RequireAuth>
        <FridgePage/>
      </RequireAuth>
    ),
  },
  {
    path: '/calorie-tracking',
    element: (
      <RequireAuth>
        <PlaceholderPage title="Calorie Tracking" />
      </RequireAuth>
    ),
  },
  {
    path: '/recipes',
    element: (
      <RequireAuth>
        <RecipePage />
      </RequireAuth>
    ),
  },
    {
    path: '/recipes/create',
    element: (
      <RequireAuth>
        <CreateRecipePage />
      </RequireAuth>
    ),
  },
    {
    path: '/recipes/:id',
    element: (
      <RequireAuth>
        <RecipeDetail />
      </RequireAuth>
    ),
  },
  {
    path: '/account',
    element: (
      <RequireAuth>
        <AccountPage />
      </RequireAuth>
    ),
  },
  {
    path: '/nearby-stores',
    element: (
      <RequireAuth>
        <PlaceholderPage title="Nearby Stores" />
      </RequireAuth>
    ),
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
