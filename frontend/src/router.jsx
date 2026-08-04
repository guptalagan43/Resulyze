import { createBrowserRouter, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import Login from './pages/Login'
import RecruiterDashboard from './pages/RecruiterDashboard'
import CandidatePortal from './pages/CandidatePortal'
import NotFound from './pages/NotFound'

const ProtectedRoute = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />

  // If a specific role is required, check it
  if (requiredRole) {
    try {
      const userStr = localStorage.getItem('user')
      const user = userStr ? JSON.parse(userStr) : null
      if (user && user.role !== requiredRole) {
        // Redirect candidates away from recruiter dashboard
        if (user.role === 'candidate') return <Navigate to="/check" replace />
        return <Navigate to="/dashboard" replace />
      }
    } catch {
      // If user data is corrupt, let it through and the API will handle auth
    }
  }

  return children
}

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Login initialMode="register" /> },
  { path: "/dashboard", element: <ProtectedRoute requiredRole="recruiter"><RecruiterDashboard /></ProtectedRoute> },
  { path: "/check", element: <CandidatePortal /> },
  { path: "*", element: <NotFound /> },
])

export default router
