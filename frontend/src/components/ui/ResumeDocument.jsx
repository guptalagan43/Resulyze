import React from 'react'

export default function ResumeDocument({
  candidateName = 'Daniel Destefanis',
  skills = [],
  jobTitle = 'Frontend Developer',
  companyName = 'CodeNest',
  theme = 'light',
}) {
  // Ensure we have some default skills if none are parsed
  const displaySkills = skills && skills.length > 0
    ? skills.slice(0, 10)
    : ['React.js', 'JavaScript', 'HTML5 & CSS3', 'UI/UX Design', 'Tailwind CSS', 'TypeScript', 'Git & GitHub']

  // Pre-generate experiences based on candidate data
  const experiences = [
    {
      role: `${jobTitle}`,
      company: `${companyName || 'Innovative Solutions'}`,
      period: 'January 2024 — Present',
      bullets: [
        'Led development of core web interfaces, driving a 25% increase in user engagement.',
        'Collaborated with designers and product managers to prototype and build high-fidelity interactive systems.',
        'Mentored junior engineers and advocated for clean, accessible CSS and design tokens.',
      ],
    },
    {
      role: `Senior Software Specialist`,
      company: 'AppForge Studio',
      period: 'March 2021 — December 2023',
      bullets: [
        'Built scalable, reusable React component libraries, reducing frontend development time by 40%.',
        'Implemented modern state management solutions and optimized client-side application performance.',
        'Established code quality guidelines, code reviews, and comprehensive automated testing suites.',
      ],
    },
    {
      role: `Frontend Developer`,
      company: 'WebFlow Agency',
      period: 'June 2018 — February 2021',
      bullets: [
        'Developed custom web applications using modern JavaScript standards and responsive grids.',
        'Integrated RESTful APIs and ensured cross-browser layout consistency and mobile responsiveness.',
      ],
    },
  ]

  return (
    <div className="bg-white text-slate-800 rounded-2xl border border-slate-200/80 shadow-md p-6 max-w-full font-sans text-[11px] leading-relaxed transition-all duration-300">
      {/* Header */}
      <div className="border-b border-slate-100 pb-4 mb-4 text-left">
        <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-1">
          {candidateName || 'Candidate Name'}
        </h2>
        <div className="text-slate-500 text-[10px] flex flex-wrap gap-2">
          <span>555-321-1234</span>
          <span>•</span>
          <span>{candidateName ? `${candidateName.toLowerCase().replace(/\s+/g, '')}@email.com` : 'candidate@email.com'}</span>
          <span>•</span>
          <span>github.com/candidate</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-5 gap-6">
        {/* Left Column (Experience) */}
        <div className="col-span-3 space-y-4 text-left">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-accent border-b border-accent/10 pb-1 mb-2">
              Experience
            </h3>
            <div className="space-y-3">
              {experiences.map((exp, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-900 text-[10px]">
                      {exp.role} — <span className="text-accent">{exp.company}</span>
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono shrink-0">{exp.period}</span>
                  </div>
                  <ul className="list-disc pl-3 text-slate-600 space-y-0.5 text-[9.5px]">
                    {exp.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Education / Skills / Tools) */}
        <div className="col-span-2 space-y-4 text-left border-l border-slate-100 pl-4">
          {/* Education */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-accent border-b border-accent/10 pb-1 mb-2">
              Education
            </h3>
            <div>
              <p className="font-bold text-slate-900">B.S. in Computer Science</p>
              <p className="text-slate-500 text-[9px]">University of Tech (2014 - 2018)</p>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-accent border-b border-accent/10 pb-1 mb-2">
              Skills
            </h3>
            <div className="flex flex-wrap gap-1">
              {displaySkills.map((skill, i) => (
                <span
                  key={i}
                  className="bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200/50 text-[9px]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-accent border-b border-accent/10 pb-1 mb-2">
              Tools
            </h3>
            <p className="text-slate-600 text-[9.5px]">
              VS Code, Git, Figma, Docker, Webpack, Postman, Jest, Vite, Vercel
            </p>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-accent border-b border-accent/10 pb-1 mb-2">
              Social
            </h3>
            <div className="space-y-0.5 text-slate-600 text-[9.5px]">
              <div>linkedin.com/in/candidate</div>
              <div>portfolio.design/candidate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
