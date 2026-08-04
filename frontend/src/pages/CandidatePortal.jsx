import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Shell from '../components/layout/Shell'
import FileDropZone from '../components/ui/FileDropZone'
import ResumeDocument from '../components/ui/ResumeDocument'
import ResumeReviewPanel from '../components/analysis/ResumeReviewPanel'
import useToastStore from '../store/toastStore'
import useAuthStore from '../store/authStore'
import client from '../api/client'

// High-fidelity mock applications data to pre-populate dashboard for signed-in users
const INITIAL_MOCK_APPS = [
  {
    id: 'mock-1',
    companyName: 'CodeNest',
    jobTitle: 'Frontend Dev',
    candidateName: 'Daniel Destefanis',
    matchScore: 88,
    issuesCount: 19,
    candidateSkills: ['React.js', 'JavaScript (ES6+)', 'HTML5 & CSS3', 'Tailwind CSS', 'Redux Toolkit', 'REST APIs', 'Git & GitHub', 'Vercel', 'TypeScript'],
    scoreBreakdown: { total: 88, similarity: 82, skills: 88, experience: 85, education: 90, certifications: 50 },
    skillGaps: [
      { skill_name: 'TypeScript', gap_type: 'present', required_level: 'Intermediate' },
      { skill_name: 'Next.js', gap_type: 'critical', required_level: 'Advanced', recommended_resources: ['Official Next.js Learn Course', 'Next.js Dev Guide'] }
    ],
    jdText: 'Looking for a Senior Frontend Developer proficient in React.js, Tailwind CSS, TypeScript, and Next.js.'
  },
  {
    id: 'mock-2',
    companyName: 'LoopStack',
    jobTitle: 'Backend Developer',
    candidateName: 'Thomas Shelby',
    matchScore: 43,
    issuesCount: 38,
    candidateSkills: ['Python', 'Django', 'SQL', 'PostgreSQL', 'Docker'],
    scoreBreakdown: { total: 43, similarity: 45, skills: 43, experience: 40, education: 50, certifications: 50 },
    skillGaps: [
      { skill_name: 'Python', gap_type: 'present', required_level: 'Advanced' },
      { skill_name: 'Kubernetes', gap_type: 'critical', required_level: 'Intermediate', recommended_resources: ['Kubernetes Basics', 'Docker & K8s Bootcamp'] },
      { skill_name: 'Redis', gap_type: 'critical', required_level: 'Intermediate', recommended_resources: ['Redis University Courses'] }
    ],
    jdText: 'We need a Backend Developer to build scalable APIs using Python, Django, Docker, Kubernetes, and Redis.'
  },
  {
    id: 'mock-3',
    companyName: 'Bytebase',
    jobTitle: 'Database Specialist',
    candidateName: 'Sherlock Holmes',
    matchScore: 68,
    issuesCount: 27,
    candidateSkills: ['SQL', 'Database Tuning', 'Security Audit', 'Linux', 'Query Optimization'],
    scoreBreakdown: { total: 68, similarity: 70, skills: 68, experience: 65, education: 70, certifications: 50 },
    skillGaps: [
      { skill_name: 'SQL', gap_type: 'present', required_level: 'Advanced' },
      { skill_name: 'NoSQL', gap_type: 'critical', required_level: 'Intermediate', recommended_resources: ['MongoDB Basics', 'DynamoDB Guide'] }
    ],
    jdText: 'Seeking a Database Specialist with experience in SQL database tuning, Query Optimization, and NoSQL databases.'
  },
  {
    id: 'mock-4',
    companyName: 'LaunchForge',
    jobTitle: 'Product Manager',
    candidateName: 'Terrance Ryan',
    matchScore: 68,
    issuesCount: 27,
    candidateSkills: ['Product Roadmap', 'Agile', 'Jira', 'Scrum', 'Market Analysis'],
    scoreBreakdown: { total: 68, similarity: 65, skills: 68, experience: 75, education: 60, certifications: 50 },
    skillGaps: [
      { skill_name: 'Agile', gap_type: 'present', required_level: 'Advanced' },
      { skill_name: 'SQL for Product Managers', gap_type: 'moderate', required_level: 'Basic' }
    ],
    jdText: 'Hire a Product Manager to define roadmap, orchestrate agile sprints in Jira, and conduct analytics using SQL.'
  },
  {
    id: 'mock-5',
    companyName: 'SyncLayer',
    jobTitle: 'Full Stack Developer',
    candidateName: 'Michelle Sanders',
    matchScore: 73,
    issuesCount: 23,
    candidateSkills: ['React', 'Node.js', 'Express', 'MongoDB', 'AWS', 'Tailwind'],
    scoreBreakdown: { total: 73, similarity: 75, skills: 73, experience: 70, education: 80, certifications: 50 },
    skillGaps: [
      { skill_name: 'React', gap_type: 'present', required_level: 'Advanced' },
      { skill_name: 'TypeScript', gap_type: 'critical', required_level: 'Advanced', recommended_resources: ['TypeScript Deep Dive'] }
    ],
    jdText: 'Looking for a Full Stack Engineer experienced in React, Node.js, Express, MongoDB, and TypeScript.'
  },
  {
    id: 'mock-6',
    companyName: 'Cloudverge',
    jobTitle: 'DevOps Engineer',
    candidateName: 'Daniel Harris',
    matchScore: 47,
    issuesCount: 38,
    candidateSkills: ['Kubernetes', 'Terraform', 'AWS', 'CI/CD', 'Linux', 'Docker'],
    scoreBreakdown: { total: 47, similarity: 50, skills: 47, experience: 40, education: 50, certifications: 50 },
    skillGaps: [
      { skill_name: 'Terraform', gap_type: 'present', required_level: 'Intermediate' },
      { skill_name: 'Python Scripting', gap_type: 'critical', required_level: 'Advanced', recommended_resources: ['Python Scripting for DevOps'] }
    ],
    jdText: 'DevOps Engineer needed. Must have AWS, Terraform, Kubernetes, and Python scripting skills.'
  }
]

export default function CandidatePortal() {
  const [view, setView] = useState('dashboard') // 'dashboard', 'upload', 'report'
  const [apps, setApps] = useState([])
  const [activeApp, setActiveApp] = useState(null)

  // Form states
  const [companyName, setCompanyName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jdText, setJdText] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  // Store a reference to the uploaded file URL for preview
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null)

  const { addToast } = useToastStore()
  const { isAuthenticated } = useAuthStore()

  // Load applications from localStorage on mount — only for authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      const stored = localStorage.getItem('resulyze_candidate_apps')
      if (stored) {
        setApps(JSON.parse(stored))
      } else {
        localStorage.setItem('resulyze_candidate_apps', JSON.stringify(INITIAL_MOCK_APPS))
        setApps(INITIAL_MOCK_APPS)
      }
    } else {
      // For unauthenticated users, start with empty apps
      setApps([])
    }
  }, [isAuthenticated])

  // Save applications list
  const saveApps = (newApps) => {
    setApps(newApps)
    localStorage.setItem('resulyze_candidate_apps', JSON.stringify(newApps))
  }

  // Handle analysis form submission
  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!file) {
      addToast('Please upload your resume file', 'warning')
      return
    }
    if (!companyName.trim()) {
      addToast('Please enter the company name', 'warning')
      return
    }
    if (!jobTitle.trim()) {
      addToast('Please enter the job title', 'warning')
      return
    }
    if (!jdText.trim()) {
      addToast('Please enter the job description', 'warning')
      return
    }

    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('job_text', jdText)
      
      const { data } = await client.post('/analysis/self-check', fd)

      // Create an object URL from the uploaded file for PDF preview
      const fileUrl = URL.createObjectURL(file)
      setUploadedFileUrl(fileUrl)
      
      // Map self-check response to dashboard application card
      const newApp = {
        id: `app-${Date.now()}`,
        companyName: companyName.trim(),
        jobTitle: jobTitle.trim(),
        candidateName: data.candidate_name || 'Candidate Name',
        matchScore: data.match_score || 0,
        // Approximate issues count based on skill gaps
        issuesCount: (data.skill_gaps || []).filter(g => g.gap_type === 'critical').length + 3,
        candidateSkills: data.candidate_skills || [],
        scoreBreakdown: data.score_breakdown || {},
        skillGaps: data.skill_gaps || [],
        jdText: jdText,
        resumeFileUrl: fileUrl, // Store the URL for this session
      }

      const updatedApps = [newApp, ...apps]
      saveApps(updatedApps)
      
      addToast('Analysis complete!', 'success')
      setActiveApp(newApp)
      setView('report')

      // Reset form fields
      setCompanyName('')
      setJobTitle('')
      setJdText('')
      setFile(null)
    } catch (err) {
      addToast(err.response?.data?.detail || 'Analysis failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteApp = (id, e) => {
    e.stopPropagation() // prevent opening detail
    const filtered = apps.filter(a => a.id !== id)
    saveApps(filtered)
    addToast('Review record deleted', 'success')
  }

  // Helper score range color
  const getScoreColor = (score) => {
    if (score >= 75) return '#00D37F' // Success Green
    if (score >= 50) return '#D97706' // Warning Orange/Yellow
    return '#EF4444' // Danger Red
  }

  return (
    <Shell>
      {view === 'dashboard' && (
        <div className="w-full">
          {/* Dashboard Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-6 mb-8 text-left animate-fade-up">
            <div>
              <h1 className="text-3xl font-bold font-display text-text-primary tracking-tight">
                Track Your Applications &amp; Resume Ratings
              </h1>
              <p className="text-text-secondary text-sm font-medium mt-1">
                Review your submissions and check AI-powered feedback.
              </p>
            </div>
            <button
              onClick={() => setView('upload')}
              className="btn-primary flex items-center justify-center gap-1.5 self-start sm:self-center !py-2.5 !px-6 shadow-md"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Upload Resume
            </button>
          </div>

          {/* Grid of Applications */}
          {apps.length === 0 ? (
            <div className="card text-center py-16 animate-fade-up">
              <span className="text-5xl block mb-4">📂</span>
              <h3 className="text-lg font-bold text-text-primary mb-1">No applications analyzed yet</h3>
              <p className="text-text-secondary text-xs mb-6 max-w-sm mx-auto">
                Upload your resume against a job description to see your match score and ATS recommendations.
              </p>
              <button onClick={() => setView('upload')} className="btn-primary !py-2 !px-6">
                Start Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
              {apps.map((app) => {
                const score = Math.round(app.matchScore)
                const scoreColor = getScoreColor(score)
                const circumference = 2 * Math.PI * 16

                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setActiveApp(app)
                      setView('report')
                    }}
                    className="card hover:border-accent hover:shadow-md cursor-pointer transition-all duration-200 relative group flex flex-col text-left"
                  >
                    {/* Delete button */}
                    <button
                      onClick={(e) => handleDeleteApp(app.id, e)}
                      className="absolute top-4 right-16 text-text-muted hover:text-danger p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete entry"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    {/* Header */}
                    <div className="pr-12">
                      <h3 className="font-bold font-display text-text-primary text-base truncate" title={app.companyName}>
                        {app.companyName}
                      </h3>
                      <p className="text-xs text-text-secondary font-semibold mt-0.5 truncate" title={app.jobTitle}>
                        {app.jobTitle}
                      </p>
                    </div>

                    {/* Radial score gauge top right */}
                    <div className="absolute top-4 right-4 flex items-center justify-center w-10 h-10">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="16" className="stroke-slate-100" strokeWidth="3" fill="transparent" />
                        <circle
                          cx="20"
                          cy="20"
                          r="16"
                          stroke={scoreColor}
                          strokeWidth="3"
                          fill="transparent"
                          strokeDasharray={circumference}
                          strokeDashoffset={circumference - (score / 100) * circumference}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-[9px] font-bold font-mono text-text-primary">{score}</span>
                    </div>

                    {/* Resume Miniature Mockup Document */}
                    <div className="bg-slate-50 border border-slate-200/50 rounded-lg p-3.5 mt-5 h-56 overflow-hidden flex flex-col gap-2 relative transition-colors group-hover:bg-slate-100/50">
                      <div className="flex items-center gap-1.5 border-b border-slate-200/80 pb-1.5">
                        <div className="w-4 h-4 rounded-full bg-accent-dim text-accent flex items-center justify-center text-[7px] font-bold uppercase shrink-0">
                          {app.candidateName?.charAt(0)}
                        </div>
                        <span className="text-[9px] font-bold text-slate-800 truncate">{app.candidateName}</span>
                      </div>
                      <div className="flex gap-1.5 items-baseline">
                        <span className="text-[7px] font-bold text-accent uppercase shrink-0">Experience</span>
                        <div className="h-0.5 bg-slate-200 flex-1 rounded"></div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-1.5 w-5/6 bg-slate-300 rounded"></div>
                        <div className="h-1 w-full bg-slate-200 rounded"></div>
                        <div className="h-1 w-11/12 bg-slate-200 rounded"></div>
                      </div>
                      <div className="flex gap-1.5 items-baseline mt-1">
                        <span className="text-[7px] font-bold text-accent uppercase shrink-0">Skills</span>
                        <div className="h-0.5 bg-slate-200 flex-1 rounded"></div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {app.candidateSkills.slice(0, 5).map((skill) => (
                          <span key={skill} className="bg-white border border-slate-200 text-slate-600 px-1 py-0.5 rounded text-[6.5px] font-medium shrink-0">
                            {skill}
                          </span>
                        ))}
                      </div>
                      {/* Gradient overlay bottom */}
                      <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-slate-50 group-hover:from-slate-100/50 to-transparent pointer-events-none"></div>
                    </div>

                    {/* Bottom Status bar */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-text-muted font-medium">
                      <span>{app.issuesCount} optimization issues</span>
                      <span className="text-accent group-hover:underline">Review Details &rarr;</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {view === 'upload' && (
        <div className="max-w-2xl mx-auto text-left animate-fade-up">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between border-b border-border/40 pb-4">
            <button
              onClick={() => setView('dashboard')}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-accent font-semibold transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cancel &amp; return
            </button>
            <span className="text-xs text-text-muted font-medium">Step 1 of 2: Details</span>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight mb-2">
              Smart feedback for your <span className="bg-gradient-to-r from-accent to-[#00D37F] bg-clip-text text-transparent">dream job</span>
            </h1>
            <p className="text-text-secondary text-sm">
              Drop your resume for an ATS score and improvement tips.
            </p>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-6">
            <div className="card space-y-5 bg-white border border-border/50 p-7 shadow-md">
              <div className="flex flex-col gap-1.5">
                <label className="text-text-secondary text-xs font-semibold">
                  Company Name <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., JavaScript Mastery"
                  className="input-field"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-text-secondary text-xs font-semibold">
                  Job Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Frontend Developer"
                  className="input-field"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-text-secondary text-xs font-semibold">
                  Job Description <span className="text-danger">*</span>
                </label>
                <textarea
                  required
                  className="input-field min-h-[280px] resize-y"
                  placeholder="Write a clear & concise job description with responsibilities & expectations..."
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-text-secondary text-xs font-semibold">
                  Upload Resume <span className="text-danger">*</span>
                </label>
                {file ? (
                  <div className="border border-border rounded-xl p-5 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-accent-dim text-accent flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-text-primary truncate max-w-[280px]">{file.name}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-xs font-bold text-danger hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <FileDropZone onFiles={(files) => setFile(files[0])} />
                )}
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="btn-primary text-base font-semibold !py-3.5 !px-10 shadow-md min-w-[200px]"
                disabled={loading}
              >
                {loading ? 'Analyzing Resume...' : 'Save & Analyze Resume'}
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'report' && activeApp && (
        <div className="w-full animate-fade-up">
          {/* Split layout: Resume on Left, Feedback Panel on Right */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left side (Resume Document Preview) */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 max-h-[85vh] overflow-y-auto pr-1">
              {activeApp.resumeFileUrl ? (
                /* Show actual uploaded file */
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md overflow-hidden">
                  <div className="bg-slate-50 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-text-primary">Uploaded Resume</span>
                    <span className="text-[10px] text-text-muted font-medium">{activeApp.candidateName}</span>
                  </div>
                  <iframe
                    src={`${activeApp.resumeFileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                    className="w-full border-0"
                    style={{ height: '75vh' }}
                    title="Resume Preview"
                  />
                </div>
              ) : (
                /* Fallback: generated resume preview for mock data */
                <ResumeDocument
                  candidateName={activeApp.candidateName}
                  skills={activeApp.candidateSkills}
                  jobTitle={activeApp.jobTitle}
                  companyName={activeApp.companyName}
                />
              )}
            </div>

            {/* Right side (Review Details panel) */}
            <div className="lg:col-span-7">
              <ResumeReviewPanel
                companyName={activeApp.companyName}
                jobTitle={activeApp.jobTitle}
                matchScore={activeApp.matchScore}
                scoreBreakdown={activeApp.scoreBreakdown}
                skillGaps={activeApp.skillGaps}
                candidateSkills={activeApp.candidateSkills}
                onBack={() => setView('dashboard')}
                isAuthenticated={isAuthenticated}
              />
            </div>
          </div>
        </div>
      )}
    </Shell>
  )
}
