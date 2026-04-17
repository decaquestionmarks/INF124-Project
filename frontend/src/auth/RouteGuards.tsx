import type { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from './AuthContext.tsx'

export function RequireAuth({ children }: PropsWithChildren) {
  const { user, isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export function RedirectIfAuthenticated({ children }: PropsWithChildren) {
  const { user, isAuthLoading } = useAuth()

  if (isAuthLoading) {
    return null
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
