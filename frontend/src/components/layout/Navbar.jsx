import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../../store/authStore'

export default function Navbar() {
  const { isAuthenticated, user, clearAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearAuth()
    navigate('/login')
  }

  return (
    <nav className="bg-surface/85 backdrop-blur-md border-b border-border/40 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold font-display tracking-tight text-text-primary group-hover:opacity-90 transition-opacity">
            RE<span className="bg-gradient-to-r from-accent to-success bg-clip-text text-transparent">SULYZE</span>
          </span>
        </Link>
        <div className="flex items-center gap-6">
          <Link
            to="/check"
            onClick={(e) => {
              if (window.location.pathname === '/check') {
                e.preventDefault()
                window.location.href = '/check'
              }
            }}
            className="text-text-secondary hover:text-text-primary font-medium text-sm transition-colors"
          >
            Check Resume
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="text-text-secondary hover:text-text-primary font-medium text-sm transition-colors">
                Dashboard
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-border/60">
                <span className="w-7 h-7 rounded-full bg-accent-dim text-accent flex items-center justify-center font-bold text-xs">
                  {user?.full_name?.charAt(0) || 'U'}
                </span>
                <span className="text-text-secondary text-xs font-medium font-mono hidden sm:inline">{user?.full_name}</span>
              </div>
              <button onClick={handleLogout} className="text-text-secondary hover:text-danger font-medium text-sm transition-colors">
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-text-secondary hover:text-text-primary font-medium text-sm transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-sm !py-2 !px-4 shadow-sm">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
