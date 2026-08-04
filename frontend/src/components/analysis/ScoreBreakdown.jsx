import ScoreCard from '../ui/ScoreCard'
import ProgressBar from '../ui/ProgressBar'

export default function ScoreBreakdown({ breakdown }) {
  if (!breakdown) return null

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-start gap-6">
        <ScoreCard score={breakdown.total} size="lg" />
        <div className="flex-1 flex flex-col gap-3 pt-2">
          <ProgressBar label="Skills" value={breakdown.skills} />
          <ProgressBar label="Experience" value={breakdown.experience} />
          <ProgressBar label="Education" value={breakdown.education} />
          <ProgressBar label="Certifications" value={breakdown.certifications} />
          <ProgressBar label="Similarity" value={breakdown.similarity} color="bg-accent" />
        </div>
      </div>
    </div>
  )
}
