import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Shell from '../components/layout/Shell'
import useAuthStore from '../store/authStore'
import useToastStore from '../store/toastStore'
import client from '../api/client'

export default function Login({ initialMode = 'login' }) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register')
  const [form, setForm] = useState({ email: '', password: '', full_name: '', role: 'candidate' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const { setAuth, isAuthenticated, user } = useAuthStore()
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  // Redirect away if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(user?.role === 'recruiter' ? '/dashboard' : '/check', { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  // Sync isRegister with initialMode if the route changes (direct URL navigation)
  useEffect(() => {
    setIsRegister(initialMode === 'register')
  }, [initialMode])

  const validateForm = () => {
    const newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Enter a valid email (e.g. xyz123@gmail.com)'
    }

    if (!form.password) {
      newErrors.password = 'Password is required'
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/[a-zA-Z]/.test(form.password)) {
      newErrors.password = 'Password must contain at least 1 letter'
    } else if (!/[0-9]/.test(form.password)) {
      newErrors.password = 'Password must contain at least 1 number'
    }

    if (isRegister) {
      if (!form.full_name.trim()) {
        newErrors.full_name = 'Full name is required'
      }
      if (!form.role) {
        newErrors.role = 'Please select a role'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const url = isRegister ? '/auth/register' : '/auth/login'
      const payload = isRegister ? form : { email: form.email, password: form.password }
      const { data } = await client.post(url, payload)
      setAuth(data.user, data.access_token)
      addToast(`Welcome, ${data.user.full_name}!`, 'success')

      // Route based on user role
      if (data.user.role === 'recruiter') {
        navigate('/dashboard')
      } else {
        navigate('/check')
      }
    } catch (err) {
      addToast(err.response?.data?.detail || 'Authentication failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    // Clear error for this field on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const toggleMode = () => {
    setIsRegister((prev) => !prev)
    setErrors({})
    // Update the URL without full page reload
    navigate(isRegister ? '/login' : '/register', { replace: true })
  }

  return (
    <Shell>
      <div className="flex flex-col items-center justify-center min-h-[75vh] py-8 text-left">
        <div className="text-center mb-8 animate-fade-up">
          <h2 className="text-4xl font-display font-bold text-text-primary mb-2 tracking-tight">
            {isRegister ? 'Welcome' : 'Welcome Back'}
          </h2>
          <p className="text-text-secondary text-sm font-medium">
            {isRegister ? 'Sign Up to Start Your Job Journey' : 'Log In to Continue Your Job Journey'}
          </p>
        </div>

        <div className="card w-full max-w-[460px] animate-fade-up border border-border/50 p-8 bg-white/90 backdrop-blur-sm shadow-md">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            {isRegister && (
              <div className="flex flex-col gap-1.5">
                <label className="text-text-secondary text-xs font-semibold">
                  Full Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text" placeholder="Enter your full name" required
                  className={`input-field ${errors.full_name ? 'border-danger focus:border-danger focus:ring-danger' : ''}`}
                  value={form.full_name}
                  onChange={(e) => update('full_name', e.target.value)}
                />
                {errors.full_name && (
                  <span className="text-danger text-[11px] font-medium">{errors.full_name}</span>
                )}
              </div>
            )}
            
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-xs font-semibold">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                type="email" placeholder="xyz123@gmail.com" required
                className={`input-field ${errors.email ? 'border-danger focus:border-danger focus:ring-danger' : ''}`}
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
              />
              {errors.email && (
                <span className="text-danger text-[11px] font-medium">{errors.email}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-xs font-semibold">
                Password <span className="text-danger">*</span>
              </label>
              <input
                type="password" placeholder="Min 8 chars, 1 letter + 1 number" required
                className={`input-field ${errors.password ? 'border-danger focus:border-danger focus:ring-danger' : ''}`}
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
              />
              {errors.password && (
                <span className="text-danger text-[11px] font-medium">{errors.password}</span>
              )}
            </div>

            {isRegister && (
              <div className="flex flex-col gap-1.5">
                <label className="text-text-secondary text-xs font-semibold">
                  I am a <span className="text-danger">*</span>
                </label>
                <select
                  className={`input-field cursor-pointer ${errors.role ? 'border-danger focus:border-danger focus:ring-danger' : ''}`}
                  value={form.role}
                  onChange={(e) => update('role', e.target.value)}
                >
                  <option value="candidate">Candidate (Self Check)</option>
                  <option value="recruiter">Recruiter</option>
                </select>
                {errors.role && (
                  <span className="text-danger text-[11px] font-medium">{errors.role}</span>
                )}
              </div>
            )}

            <button type="submit" className="btn-primary w-full text-sm font-semibold !py-3 shadow-md mt-2" disabled={loading}>
              {loading ? 'Loading...' : isRegister ? 'Create Account' : 'Log In'}
            </button>
          </form>
        </div>

        <p className="text-center text-text-secondary text-sm mt-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            type="button"
            onClick={toggleMode}
            className="text-accent font-bold hover:underline bg-transparent border-none cursor-pointer"
          >
            {isRegister ? 'Log In' : 'Sign up'}
          </button>
        </p>
      </div>
    </Shell>
  )
}
