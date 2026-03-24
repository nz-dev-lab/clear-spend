/**
 * ProtectedRoute.tsx — Redirects unauthenticated users to /login
 *
 * Wrap any page that requires login with this component.
 * If there's no access token in localStorage, the user gets sent to /login.
 * Once logged in, they're sent back to the page they were trying to reach.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom'

export default function ProtectedRoute() {
  const token = localStorage.getItem('accessToken')
  const location = useLocation()

  if (!token) {
    // Save where they were going so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Token exists — render the child route
  return <Outlet />
}
