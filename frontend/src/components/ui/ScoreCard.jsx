import { useEffect, useRef } from 'react'

export default function ScoreCard({ score, label = 'MATCH SCORE', size = 'lg' }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    let current = 0
    const target = Math.round(score)
    const step = Math.ceil(target / 40)
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      if (ref.current) ref.current.textContent = current
      if (current >= target) clearInterval(timer)
    }, 20)
    return () => clearInterval(timer)
  }, [score])

  const color = score >= 75 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-danger'
  const sizeClass = size === 'lg' ? 'text-5xl' : 'text-3xl'

  return (
    <div className="card-glow flex flex-col items-center gap-1">
      <span ref={ref} className={`font-mono font-bold ${sizeClass} ${color}`}>
        0
      </span>
      <span className="text-text-secondary text-xs uppercase tracking-wider">
        {label}
      </span>
    </div>
  )
}
