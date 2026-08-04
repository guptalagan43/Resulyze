export default function SkillBadge({ skill, type }) {
  const styles = {
    present: 'bg-success/15 text-success border-success/30',
    critical: 'bg-danger/15 text-danger border-danger/30',
    moderate: 'bg-warning/15 text-warning border-warning/30',
    surplus: 'bg-info/15 text-info border-info/30',
  }

  const icons = { present: '✓', critical: '●', moderate: '○', surplus: '◆' }

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono px-2.5 py-1 rounded-full border ${styles[type] || styles.present}`}>
      <span>{icons[type] || ''}</span>
      {skill}
    </span>
  )
}
