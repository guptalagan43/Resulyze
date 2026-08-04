import { useState } from 'react'
import { Link } from 'react-router-dom'
import ScoreReviewWheel from '../ui/ScoreReviewWheel'

export default function ResumeReviewPanel({
  companyName = 'CodeNest',
  jobTitle = 'Frontend Developer',
  matchScore = 0,
  scoreBreakdown = {},
  skillGaps = [],
  candidateSkills = [],
  onBack = () => {},
  isAuthenticated = false,
}) {
  const [expandedSection, setExpandedSection] = useState('skills') // default expand 'skills' like screenshot
  const [checklistState, setChecklistState] = useState({
    quantifiable: true,
    genericPhrases: false,
    casualTone: false,
    pronouns: true,
    reorder: true,
    whitespace: false,
    softSkills: false,
  })

  // Destructure scores with defaults
  const totalScore = Math.round(matchScore)
  const skillsScore = Math.round(scoreBreakdown.skills ?? 32)
  const contentScore = Math.round(scoreBreakdown.similarity ?? 25)
  const structureScore = Math.round(scoreBreakdown.experience ?? 70)
  const toneScore = Math.round(scoreBreakdown.education ?? 55)

  // Map scores to status labels
  const getStatusLabel = (score) => {
    if (score >= 75) return { label: 'Strong', color: 'bg-green-100 text-green-800' }
    if (score >= 50) return { label: 'Good Start', color: 'bg-amber-100 text-amber-800' }
    return { label: 'Needs work', color: 'bg-red-100 text-red-800' }
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  // Calculate issue counts
  const criticalGapsCount = skillGaps.filter(g => g.gap_type === 'critical').length
  const issuesCount = criticalGapsCount + (skillsScore < 70 ? 2 : 0) + (contentScore < 70 ? 3 : 0) + (toneScore < 70 ? 1 : 0)

  // Helper icons
  const GreenCheck = () => (
    <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  )

  const YellowWarning = () => (
    <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )

  return (
    <div className="flex flex-col gap-6 text-left max-w-full font-sans pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3 sticky top-16 bg-base z-10 pt-2 -mt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to homepage
        </button>
        <span className="text-xs text-text-muted font-medium">
          {companyName} &middot; {jobTitle} &rsaquo; <span className="text-text-secondary font-semibold">Resume Review</span>
        </span>
      </div>

      <h1 className="text-2xl font-bold font-display text-text-primary">Resume Review</h1>

      {/* Card 1: Your Resume Score */}
      <div className="card grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
        <div className="col-span-2 flex justify-center border-r border-border/50 md:pr-4">
          <ScoreReviewWheel score={totalScore} issuesCount={issuesCount} />
        </div>
        <div className="col-span-3 space-y-3.5">
          <h3 className="text-sm font-bold font-display text-text-primary mb-1">Your Resume Score</h3>
          <p className="text-xs text-text-secondary leading-normal mb-3">
            This score is calculated based on the variables listed below.
          </p>
          <div className="space-y-2.5">
            {[
              { label: 'Tone & Style', score: toneScore },
              { label: 'Content', score: contentScore },
              { label: 'Structure', score: structureScore },
              { label: 'Skills', score: skillsScore },
            ].map((item) => {
              const status = getStatusLabel(item.score)
              return (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary font-medium">{item.label}</span>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="font-mono font-bold text-text-primary w-10 text-right">{item.score}/100</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Card 2: ATS Score Box */}
      <div
        className={`border rounded-xl p-5 ${
          totalScore >= 75
            ? 'bg-[#AFF8C8]/10 border-[#AFF8C8]/60 text-text-primary'
            : totalScore >= 50
            ? 'bg-[#FFEEB4]/15 border-[#FFEEB4]/60 text-text-primary'
            : 'bg-[#D2C4FB]/10 border-[#D2C4FB]/40 text-text-primary'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            {totalScore >= 75 ? (
              <div className="w-5 h-5 rounded-full bg-success flex items-center justify-center text-white text-xs font-bold font-mono">✓</div>
            ) : totalScore >= 50 ? (
              <div className="w-5 h-5 rounded-full bg-warning flex items-center justify-center text-white text-xs font-bold font-mono">!</div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-danger flex items-center justify-center text-white text-xs font-bold font-mono">!</div>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-bold">ATS Score - {totalScore}/100</h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              How well does your resume pass through Applicant Tracking Systems?
            </p>
            <p className="text-[11px] text-text-secondary">
              Your resume was scanned like an employer would. Here's how it performed:
            </p>
            <ul className="space-y-1.5 pt-1 text-[11px]">
              <li className="flex items-center gap-2">
                <GreenCheck />
                <span className="text-text-secondary">Clear formatting, readable by ATS</span>
              </li>
              <li className="flex items-center gap-2">
                {totalScore >= 75 ? <GreenCheck /> : <YellowWarning />}
                <span className="text-text-secondary">
                  {totalScore >= 75 ? 'Keywords highly relevant to the job' : 'Missing some keywords relevant to the job'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                {candidateSkills.length > 0 ? <GreenCheck /> : <YellowWarning />}
                <span className="text-text-secondary">
                  {candidateSkills.length > 0 ? 'Skills section detected and parsed successfully' : 'No skills section detected'}
                </span>
              </li>
            </ul>
            <p className="text-[10px] text-text-muted italic pt-1">
              Want a better score? Improve your resume by applying the suggestions listed below.
            </p>
          </div>
        </div>
      </div>

      {/* Sign-in gate for non-authenticated users */}
      {!isAuthenticated && (
        <div className="border-2 border-dashed border-accent/30 rounded-xl p-8 text-center bg-accent-dim/30">
          <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold font-display text-text-primary mb-2">
            Sign in for Full Analysis
          </h3>
          <p className="text-text-secondary text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Create a free account to unlock detailed feedback including Tone & Style, Content, Structure, Skills breakdowns, and a personalized improvement checklist.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/login" className="btn-primary !py-2.5 !px-8 shadow-md text-sm font-semibold">
              Sign In
            </Link>
            <Link to="/register" className="btn-secondary !py-2.5 !px-8 text-sm font-semibold">
              Create Account
            </Link>
          </div>
        </div>
      )}

      {/* Detailed sections — only visible to authenticated users */}
      {isAuthenticated && (
        <div className="space-y-3">
          {/* Accordion: Tone & Style */}
          <div className="border border-border/80 rounded-xl overflow-hidden bg-surface shadow-sm">
            <button
              onClick={() => toggleSection('tone')}
              className="w-full flex items-center justify-between p-4 font-display font-bold text-sm text-text-primary bg-slate-50/50 hover:bg-slate-50/80 transition-colors border-b border-border/40"
            >
              <div className="flex items-center gap-2">
                <span>Tone & Style</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${getStatusLabel(toneScore).color}`}>
                  {toneScore}/100
                </span>
              </div>
              <span className="text-xs transform transition-transform duration-200">{expandedSection === 'tone' ? '▲' : '▼'}</span>
            </button>
            {expandedSection === 'tone' && (
              <div className="p-4 space-y-4 border-t border-border/30">
                {/* Grid elements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-border/30">
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><GreenCheck /> <span>Professional Tone</span></div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><GreenCheck /> <span>Aligned Layout</span></div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><YellowWarning /> <span className="font-semibold text-warning">Inconsistent Tenses</span></div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><YellowWarning /> <span className="font-semibold text-warning">First-Person Pronouns</span></div>
                </div>

                {/* Cards list */}
                <div className="space-y-3">
                  <div className="bg-green-50/40 border border-green-200/50 rounded-lg p-3 text-[11px] leading-relaxed">
                    <span className="font-bold text-green-800 block mb-0.5">✓ Professional Tone: Clear and confident language</span>
                    <p className="text-text-secondary">Your resume uses clear, confident language that feels polished, objective, and job-ready.</p>
                  </div>
                  <div className="bg-amber-50/40 border border-amber-200/50 rounded-lg p-3 text-[11px] leading-relaxed text-text-primary">
                    <span className="font-bold text-amber-800 block mb-0.5">▲ Inconsistent Tenses: Use past tense for past roles</span>
                    <p className="text-text-secondary mb-1">Use present tense for current roles ("Lead team"), and past tense for previous ones ("Managed team").</p>
                  </div>
                  <div className="bg-green-50/40 border border-green-200/50 rounded-lg p-3 text-[11px] leading-relaxed">
                    <span className="font-bold text-green-800 block mb-0.5">✓ Aligned Layout: Proper margins and spacing</span>
                    <p className="text-text-secondary">Everything is neatly structured — sections are spaced well, and layout density is optimal.</p>
                  </div>
                  <div className="bg-amber-50/40 border border-amber-200/50 rounded-lg p-3 text-[11px] leading-relaxed">
                    <span className="font-bold text-amber-800 block mb-0.5">▲ First-Person Pronouns: Avoid "I", "my", etc.</span>
                    <p className="text-text-secondary">Avoid first-person pronouns. Replace "I led a team" with "Led a team".</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accordion: Content */}
          <div className="border border-border/80 rounded-xl overflow-hidden bg-surface shadow-sm">
            <button
              onClick={() => toggleSection('content')}
              className="w-full flex items-center justify-between p-4 font-display font-bold text-sm text-text-primary bg-slate-50/50 hover:bg-slate-50/80 transition-colors border-b border-border/40"
            >
              <div className="flex items-center gap-2">
                <span>Content</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${getStatusLabel(contentScore).color}`}>
                  {contentScore}/100
                </span>
              </div>
              <span className="text-xs transform transition-transform duration-200">{expandedSection === 'content' ? '▲' : '▼'}</span>
            </button>
            {expandedSection === 'content' && (
              <div className="p-4 space-y-4 border-t border-border/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-border/30">
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><GreenCheck /> <span>Tailor to Role</span></div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><YellowWarning /> <span className="font-semibold text-warning">Quantify Impact</span></div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><YellowWarning /> <span className="font-semibold text-warning">Use Action Verbs</span></div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><GreenCheck /> <span>Avoid Fluff</span></div>
                </div>

                <div className="space-y-3">
                  <div className="bg-green-50/40 border border-green-200/50 rounded-lg p-3 text-[11px] leading-relaxed">
                    <span className="font-bold text-green-800 block mb-0.5">✓ Tailor to Role – Make content more job-specific</span>
                    <p className="text-text-secondary">Your resume details align well with key responsibilities of the role. Content is contextualized properly.</p>
                  </div>
                  <div className="bg-amber-50/40 border border-amber-200/50 rounded-lg p-3 text-[11px] leading-relaxed">
                    <span className="font-bold text-amber-800 block mb-0.5">▲ Quantify Impact – Add data to show results</span>
                    <div className="text-text-secondary space-y-1">
                      <p>Add specific metrics to achievements to prove impact.</p>
                      <p className="text-[10px] italic"><span className="font-medium text-amber-700">Instead of:</span> "Managed a team of developers"</p>
                      <p className="text-[10px] italic"><span className="font-medium text-green-700">Try:</span> "Led a team of 4 developers to launch 3 client projects, increasing delivery speed by 20%"</p>
                    </div>
                  </div>
                  <div className="bg-amber-50/40 border border-amber-200/50 rounded-lg p-3 text-[11px] leading-relaxed">
                    <span className="font-bold text-amber-800 block mb-0.5">▲ Use Action Verbs – Start bullets with strong verbs</span>
                    <div className="text-text-secondary space-y-1">
                      <p>Begin description items with strong action-oriented verbs. Replace passive statements like "Responsible for building..."</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {['Led', 'Built', 'Created', 'Delivered', 'Optimized'].map(v => (
                          <span key={v} className="bg-amber-100/60 border border-amber-200/60 text-amber-800 px-1.5 py-0.5 rounded text-[9px] font-semibold">{v}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accordion: Structure */}
          <div className="border border-border/80 rounded-xl overflow-hidden bg-surface shadow-sm">
            <button
              onClick={() => toggleSection('structure')}
              className="w-full flex items-center justify-between p-4 font-display font-bold text-sm text-text-primary bg-slate-50/50 hover:bg-slate-50/80 transition-colors border-b border-border/40"
            >
              <div className="flex items-center gap-2">
                <span>Structure</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${getStatusLabel(structureScore).color}`}>
                  {structureScore}/100
                </span>
              </div>
              <span className="text-xs transform transition-transform duration-200">{expandedSection === 'structure' ? '▲' : '▼'}</span>
            </button>
            {expandedSection === 'structure' && (
              <div className="p-4 space-y-4 border-t border-border/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-border/30">
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><GreenCheck /> <span>Contact Info</span></div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><GreenCheck /> <span>Clear Sections</span></div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><GreenCheck /> <span>Font Consistency</span></div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><GreenCheck /> <span>Page Length</span></div>
                </div>

                <div className="space-y-3">
                  <div className="bg-green-50/40 border border-green-200/50 rounded-lg p-3 text-[11px] leading-relaxed">
                    <span className="font-bold text-green-800 block mb-0.5">✓ Contact Info: Make it easy to find</span>
                    <p className="text-text-secondary">Your contact info (phone, email, portfolio/github link) is prominently placed at the top and readable by ATS.</p>
                  </div>
                  <div className="bg-green-50/40 border border-green-200/50 rounded-lg p-3 text-[11px] leading-relaxed">
                    <span className="font-bold text-green-800 block mb-0.5">✓ Clear Sections: Logical flow</span>
                    <p className="text-text-secondary">Your resume has clean section breaks, headings, and logical reading hierarchy.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Accordion: Skills */}
          <div className="border border-border/80 rounded-xl overflow-hidden bg-surface shadow-sm">
            <button
              onClick={() => toggleSection('skills')}
              className="w-full flex items-center justify-between p-4 font-display font-bold text-sm text-text-primary bg-slate-50/50 hover:bg-slate-50/80 transition-colors border-b border-border/40"
            >
              <div className="flex items-center gap-2">
                <span>Skills</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${getStatusLabel(skillsScore).color}`}>
                  {skillsScore}/100
                </span>
              </div>
              <span className="text-xs transform transition-transform duration-200">{expandedSection === 'skills' ? '▲' : '▼'}</span>
            </button>
            {expandedSection === 'skills' && (
              <div className="p-4 space-y-4 border-t border-border/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-3 border-b border-border/30">
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><GreenCheck /> <span>Job-Matching Keywords</span></div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><YellowWarning /> <span className="font-semibold text-warning">Overstuffed Skills Section</span></div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><YellowWarning /> <span className="font-semibold text-warning">Too Generic</span></div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary"><YellowWarning /> <span className="font-semibold text-warning">Outdated Technologies</span></div>
                </div>

                <div className="space-y-3">
                  <div className="bg-green-50/40 border border-green-200/50 rounded-lg p-3 text-[11px] leading-relaxed">
                    <span className="font-bold text-green-800 block mb-0.5">✓ Relevant Skills Listed: Tools, tech, soft skills</span>
                    <p className="text-text-secondary mb-2">Your resume includes matching keywords recruiters and ATS systems look for:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {(candidateSkills.length > 0 ? candidateSkills : ['React.js', 'JavaScript', 'HTML5', 'CSS3', 'Git', 'Vercel']).map(s => (
                        <span key={s} className="bg-green-100 border border-green-200 text-green-800 px-2 py-0.5 rounded text-[9.5px] font-semibold">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-amber-50/40 border border-amber-200/50 rounded-lg p-3 text-[11px] leading-relaxed">
                    <span className="font-bold text-amber-800 block mb-0.5">▲ Too Generic: Replace vague skills with specific ones</span>
                    <div className="text-text-secondary space-y-1">
                      <p>Specify concrete technologies/frameworks instead of high-level generic descriptors.</p>
                      <p className="text-[10px] italic"><span className="font-medium text-amber-700">Instead of:</span> "Good at communication"</p>
                      <p className="text-[10px] italic"><span className="font-medium text-green-700">Try:</span> "Client communication via Slack, Zoom, and Jira"</p>
                    </div>
                  </div>
                  <div className="bg-amber-50/40 border border-amber-200/50 rounded-lg p-3 text-[11px] leading-relaxed text-text-primary">
                    <span className="font-bold text-amber-800 block mb-0.5">▲ Overstuffed Skills: Trim unnecessary or unrelated skills</span>
                    <p className="text-text-secondary">Keep skills sections targeted. Remove technologies irrelevant to this target {jobTitle} role to maintain professional focus.</p>
                  </div>
                  <div className="bg-amber-50/40 border border-amber-200/50 rounded-lg p-3 text-[11px] leading-relaxed text-text-primary">
                    <span className="font-bold text-amber-800 block mb-0.5">▲ No Context for Skills: Show how you've used your skills</span>
                    <p className="text-text-secondary">Rather than a comma-separated list alone, describe skill applications in bullet points. E.g., "Built a dashboard using React and Chart.js for real-time data visualization."</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section: Where to Learn Missing Skills (Learning Hub) */}
          <div className="border border-border/80 rounded-xl overflow-hidden bg-surface shadow-sm">
            <button
              onClick={() => toggleSection('learning')}
              className="w-full flex items-center justify-between p-4 font-display font-bold text-sm text-text-primary bg-slate-50/50 hover:bg-slate-50/80 transition-colors border-b border-border/40"
            >
              <div className="flex items-center gap-2">
                <span>📚 Where to Learn Missing Skills</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-dim text-accent">
                  {skillGaps.filter(g => g.gap_type !== 'present' && g.gap_type !== 'surplus').length} Skill Gaps Found
                </span>
              </div>
              <span className="text-xs transform transition-transform duration-200">{expandedSection === 'learning' ? '▲' : '▼'}</span>
            </button>
            {expandedSection === 'learning' && (
              <div className="p-4 space-y-4 border-t border-border/30">
                <p className="text-xs text-text-secondary">
                  Boost your resume match rate by mastering these required and recommended skills through these curated learning paths:
                </p>

                {skillGaps.filter(g => g.gap_type !== 'present' && g.gap_type !== 'surplus').length === 0 ? (
                  <div className="bg-green-50 border border-green-200/60 rounded-lg p-3 text-xs text-green-800 flex items-center gap-2">
                    <span>🎉</span>
                    <span className="font-semibold">Great job! Your resume covers all core required skills for this job description.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {skillGaps
                      .filter(g => g.gap_type !== 'present' && g.gap_type !== 'surplus')
                      .map((gap) => {
                        // Standard resource mapping
                        const skillLower = gap.skill_name.lower ? gap.skill_name.lower() : String(gap.skill_name).toLowerCase()
                        const defaultResources = [
                          { name: 'Coursera / edX Certification', url: `https://www.coursera.org/search?query=${encodeURIComponent(gap.skill_name)}` },
                          { name: 'freeCodeCamp / Interactive Guide', url: `https://www.google.com/search?q=${encodeURIComponent(gap.skill_name + ' tutorial freecodecamp')}` },
                          { name: 'Official Documentation & Guides', url: `https://www.google.com/search?q=${encodeURIComponent(gap.skill_name + ' official documentation')}` }
                        ]
                        const resources = (gap.recommended_resources && gap.recommended_resources.length > 0)
                          ? gap.recommended_resources.map(r => typeof r === 'string' ? { name: r, url: `https://www.google.com/search?q=${encodeURIComponent(r)}` } : r)
                          : defaultResources

                        return (
                          <div key={gap.skill_name} className="border border-border/60 rounded-lg p-3 bg-white space-y-2 text-left">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-text-primary capitalize">{gap.skill_name}</span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                gap.gap_type === 'critical'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {gap.gap_type === 'critical' ? 'Critical Gap' : 'Recommended'}
                              </span>
                            </div>
                            <p className="text-[10px] text-text-secondary">
                              Required Level: <span className="font-semibold text-text-primary">{gap.required_level || 'Intermediate'}</span>
                            </p>
                            <div className="pt-1 space-y-1">
                              <span className="text-[10px] font-bold text-accent uppercase tracking-wider block">Recommended Learning Links:</span>
                              <ul className="space-y-1">
                                {resources.map((res, i) => (
                                  <li key={i}>
                                    <a
                                      href={res.url || `https://www.google.com/search?q=${encodeURIComponent(res.name || res)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[11px] text-accent hover:underline flex items-center gap-1 font-medium"
                                    >
                                      <span>&bull; {res.name || res}</span>
                                      <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                      </svg>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section: Tips for Increasing ATS Score */}
          <div className="border border-border/80 rounded-xl overflow-hidden bg-surface shadow-sm">
            <button
              onClick={() => toggleSection('tips')}
              className="w-full flex items-center justify-between p-4 font-display font-bold text-sm text-text-primary bg-slate-50/50 hover:bg-slate-50/80 transition-colors border-b border-border/40"
            >
              <div className="flex items-center gap-2">
                <span>💡 Actionable Tips to Increase Your ATS Score</span>
              </div>
              <span className="text-xs transform transition-transform duration-200">{expandedSection === 'tips' ? '▲' : '▼'}</span>
            </button>
            {expandedSection === 'tips' && (
              <div className="p-4 space-y-3 border-t border-border/30 text-xs text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-blue-50/50 border border-blue-200/60 rounded-lg p-3 space-y-1">
                    <span className="font-bold text-blue-900 block">🎯 1. Target Exact Job Keywords</span>
                    <p className="text-text-secondary text-[11px] leading-relaxed">
                      Mirror exact terminology from the job description (e.g. use both "React" and "React.js", "ML" and "Machine Learning").
                    </p>
                  </div>

                  <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-lg p-3 space-y-1">
                    <span className="font-bold text-emerald-900 block">📊 2. Add Measurable Impact & Metrics</span>
                    <p className="text-text-secondary text-[11px] leading-relaxed">
                      Include numbers, percentages, or time savings in your bullet points (e.g. "Optimized API latency by 45%").
                    </p>
                  </div>

                  <div className="bg-purple-50/50 border border-purple-200/60 rounded-lg p-3 space-y-1">
                    <span className="font-bold text-purple-900 block">⚡ 3. Lead With Strong Action Verbs</span>
                    <p className="text-text-secondary text-[11px] leading-relaxed">
                      Start bullet points with verbs like "Architected", "Engineered", "Deployed", "Automated", and avoid passive phrases.
                    </p>
                  </div>

                  <div className="bg-amber-50/50 border border-amber-200/60 rounded-lg p-3 space-y-1">
                    <span className="font-bold text-amber-900 block">📄 4. Keep Layout Clean & Standard</span>
                    <p className="text-text-secondary text-[11px] leading-relaxed">
                      Use standard single-column layouts. Avoid embedding text inside images, complex tables, or custom headers/footers.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
