import { Link } from 'react-router-dom'
import Shell from '../components/layout/Shell'

export default function NotFound() {
  return (
    <Shell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-fade-up">
        <span className="text-6xl font-mono font-bold text-accent">404</span>
        <h1 className="text-xl font-display text-text-primary">Page Not Found</h1>
        <p className="text-text-secondary text-sm">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary mt-2">Go Home</Link>
      </div>
    </Shell>
  )
}
