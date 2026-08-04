export default function ProgressBar({ value, label, color }) {
  const barColor = color || (value >= 75 ? 'bg-success' : value >= 50 ? 'bg-warning' : 'bg-danger')

  return (
    <div className="flex items-center gap-3">
      <span className="text-text-secondary text-sm w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-elevated rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full animate-fill ${barColor}`}
          style={{ width: `${Math.min(value, 100)}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label}: ${value}%`}
        />
      </div>
      <span className="text-text-primary font-mono text-sm w-12 text-right">{Math.round(value)}%</span>
    </div>
  )
}
