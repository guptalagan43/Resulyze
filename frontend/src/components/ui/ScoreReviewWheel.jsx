import { useEffect, useState } from 'react'

export default function ScoreReviewWheel({ score = 0, issuesCount = 0 }) {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    let start = 0
    const end = Math.round(score)
    if (start === end) {
      setAnimatedScore(end)
      return
    }
    const duration = 800 // ms
    const stepTime = Math.abs(Math.floor(duration / end))
    const timer = setInterval(() => {
      start += 1
      setAnimatedScore(start)
      if (start >= end) {
        clearInterval(timer)
      }
    }, Math.max(stepTime, 10))

    return () => clearInterval(timer)
  }, [score])

  // Radial calculation
  const radius = 50
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference

  // Color selection matching our palette
  const getColorClass = (val) => {
    if (val >= 75) return '#00D37F' // Success Green
    if (val >= 50) return '#D97706' // Warning Orange/Yellow
    return '#EF4444' // Danger Red
  }

  const strokeColor = getColorClass(score)

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Background track */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-border"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Active track */}
          <circle
            cx="64"
            cy="64"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
          />
        </svg>
        {/* Central Text */}
        <div className="absolute flex flex-col items-center text-center">
          <span className="text-2xl font-bold font-mono text-text-primary">
            {animatedScore}/100
          </span>
          <span className="text-[10px] uppercase font-semibold text-text-secondary tracking-wider">
            {issuesCount} issues
          </span>
        </div>
      </div>
    </div>
  )
}
