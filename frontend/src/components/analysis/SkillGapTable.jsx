import SkillBadge from '../ui/SkillBadge'

export default function SkillGapTable({ gaps = [] }) {
  const critical = gaps.filter((g) => g.gap_type === 'critical')
  const moderate = gaps.filter((g) => g.gap_type === 'moderate')
  const present = gaps.filter((g) => g.gap_type === 'present')
  const surplus = gaps.filter((g) => g.gap_type === 'surplus')

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-text-primary">Skill Gaps</h3>
        <span className="text-danger text-sm font-mono">{critical.length} critical</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-text-secondary text-left">
              <th className="pb-2 pr-4">Skill</th>
              <th className="pb-2 pr-4">Status</th>
              <th className="pb-2">Required</th>
            </tr>
          </thead>
          <tbody>
            {[...critical, ...moderate, ...present, ...surplus].map((g, i) => (
              <tr key={i} className="border-b border-border/50 hover:bg-elevated/50 transition-colors">
                <td className="py-2.5 pr-4">
                  <SkillBadge skill={g.skill_name} type={g.gap_type} />
                </td>
                <td className="py-2.5 pr-4 font-mono text-xs uppercase">
                  {g.gap_type === 'present' ? '✓ Present' :
                   g.gap_type === 'critical' ? '● Missing' :
                   g.gap_type === 'moderate' ? '○ Partial' : '◆ Surplus'}
                </td>
                <td className="py-2.5 text-text-secondary text-xs">
                  {g.required_level || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {critical.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-sm text-text-secondary mb-2">Recommended Resources</h4>
          <div className="flex flex-col gap-1">
            {critical.filter(g => g.recommended_resources?.length > 0).map((g, i) => (
              <div key={i} className="text-xs text-text-muted">
                <span className="text-danger">{g.skill_name}:</span>{' '}
                {g.recommended_resources.join(', ')}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
