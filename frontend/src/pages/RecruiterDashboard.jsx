import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Shell from '../components/layout/Shell'
import FileDropZone from '../components/ui/FileDropZone'
import ScoreCard from '../components/ui/ScoreCard'
import SkillBadge from '../components/ui/SkillBadge'
import useToastStore from '../store/toastStore'
import client from '../api/client'

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('active') // 'active' (Fresh Run) vs 'history' (Past Evaluations)
  const [jdForm, setJdForm] = useState({ title: '', raw_text: '' })
  const [selectedJobId, setSelectedJobId] = useState(null)
  
  // Local session state for fresh candidate uploads (cleared on refresh/new run)
  const [sessionResumes, setSessionResumes] = useState([])
  const [sessionJob, setSessionJob] = useState(null)

  const { addToast } = useToastStore()
  const qc = useQueryClient()

  // Queries for database history
  const { data: jobsData } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => client.get('/jobs/').then((r) => r.data),
  })

  const { data: resumesData } = useQuery({
    queryKey: ['resumes'],
    queryFn: () => client.get('/resumes/').then((r) => r.data),
  })

  const { data: analysesData } = useQuery({
    queryKey: ['analyses', selectedJobId],
    queryFn: () => client.get(`/analysis/job/${selectedJobId}`).then((r) => r.data),
    enabled: !!selectedJobId,
  })

  const createJob = useMutation({
    mutationFn: (body) => client.post('/jobs/', body).then((r) => r.data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['jobs'] })
      addToast('Job description created!', 'success')
      setSessionJob(data)
      setSelectedJobId(data.id)
    },
    onError: () => addToast('Failed to create JD', 'error'),
  })

  const uploadResume = useMutation({
    mutationFn: (files) => {
      const fd = new FormData()
      files.forEach((f) => fd.append('files', f))
      return client.post('/resumes/bulk-upload', fd).then((r) => r.data)
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['resumes'] })
      addToast('Resumes uploaded & parsed!', 'success')
      const newResumes = data.resumes || []
      setSessionResumes((prev) => [...prev, ...newResumes])
    },
    onError: () => addToast('Upload failed', 'error'),
  })

  const runMatch = useMutation({
    mutationFn: () => {
      const ids = sessionResumes.length > 0
        ? sessionResumes.map((r) => r.id)
        : (resumesData?.resumes?.map((r) => r.id) || [])
      const targetJdId = sessionJob?.id || selectedJobId
      return client.post('/analysis/match', { resume_ids: ids, job_id: targetJdId }).then((r) => r.data)
    },
    onSuccess: () => {
      const targetJdId = sessionJob?.id || selectedJobId
      qc.invalidateQueries({ queryKey: ['analyses', targetJdId] })
      addToast('Matching complete!', 'success')
    },
    onError: () => addToast('Matching failed', 'error'),
  })

  const handleStartFreshSession = () => {
    setJdForm({ title: '', raw_text: '' })
    setSessionResumes([])
    setSessionJob(null)
    setSelectedJobId(null)
    addToast('Started fresh screening session', 'info')
  }

  const jobs = jobsData?.jobs || []
  const allResumes = resumesData?.resumes || []
  const analyses = analysesData?.analyses || []

  return (
    <Shell>
      <div className="text-left animate-fade-up">
        {/* Header & Sub-Navigation Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4 mb-6">
          <div>
            <h1 className="text-3xl font-display font-bold text-text-primary tracking-tight">
              Recruiter Dashboard
            </h1>
            <p className="text-text-secondary text-sm font-medium mt-1">
              Start fresh candidate evaluations or review past screening records.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-border/50 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'active'
                  ? 'bg-white text-text-primary shadow-sm border border-border/40'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              🚀 Active Screening Run
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'history'
                  ? 'bg-white text-text-primary shadow-sm border border-border/40'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              📜 Evaluated Candidates History ({jobs.length})
            </button>
          </div>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            value={activeTab === 'active' ? sessionResumes.length : allResumes.length}
            label={activeTab === 'active' ? "Session Resumes Uploaded" : "Total Database Resumes"}
            icon={
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          />
          <StatCard
            value={jobs.length}
            label="Total Job Positions"
            icon={
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            }
          />
          <StatCard
            value={analyses.length}
            label="Evaluated Candidates (Current View)"
            icon={
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v16m-6 0a2 2 0 002 2h2a2 2 0 002-2" />
              </svg>
            }
          />
        </div>

        {/* TAB 1: ACTIVE SCREENING SESSION (Fresh Run) */}
        {activeTab === 'active' && (
          <div className="space-y-8">
            {/* Active Session Status & Action */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-bold">Fresh Screening Session</span>
                <span className="text-slate-400">|</span>
                <span>Upload a JD &amp; target candidate list below for immediate evaluation.</span>
              </div>
              <button
                onClick={handleStartFreshSession}
                className="btn-secondary text-xs !py-1.5 !px-3 shrink-0"
              >
                Clear &amp; Start Fresh Session
              </button>
            </div>

            {/* Workspace Panels */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Create JD panel */}
              <div className="card bg-white border border-border/50 shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="font-display font-bold text-lg text-text-primary">1. Create Target JD</h2>
                    {sessionJob && (
                      <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded">
                        Active: {sessionJob.title}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-secondary mb-4 font-medium">Define target job requirements for this evaluation batch.</p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      createJob.mutate(jdForm)
                    }}
                    className="flex flex-col gap-4"
                  >
                    <input
                      className="input-field"
                      placeholder="Job Title (e.g. Senior Frontend Dev)"
                      required
                      value={jdForm.title}
                      onChange={(e) => setJdForm((f) => ({ ...f, title: e.target.value }))}
                    />
                    <textarea
                      className="input-field min-h-[140px] resize-y"
                      placeholder="Paste job description text here..."
                      required
                      value={jdForm.raw_text}
                      onChange={(e) => setJdForm((f) => ({ ...f, raw_text: e.target.value }))}
                    />
                    <button type="submit" className="btn-primary font-semibold shadow-sm w-full py-2.5" disabled={createJob.isPending}>
                      {createJob.isPending ? 'Creating JD...' : 'Save Job Description'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Upload Resumes panel */}
              <div className="card bg-white border border-border/50 shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <h2 className="font-display font-bold text-lg text-text-primary mb-1">2. Upload Candidate Resumes</h2>
                  <p className="text-xs text-text-secondary mb-4 font-medium">Upload incoming applicant resumes (PDF, DOCX, TXT) for this session.</p>
                  <FileDropZone onFiles={(files) => uploadResume.mutate(files)} multiple />
                  {uploadResume.isPending && (
                    <div className="space-y-2 mt-4">
                      <div className="skeleton h-3 w-full animate-pulse" />
                      <div className="skeleton h-2 w-5/6 animate-pulse" />
                    </div>
                  )}

                  {sessionResumes.length > 0 && (
                    <div className="mt-5 border border-border/40 rounded-xl overflow-hidden bg-slate-50/30">
                      <div className="bg-slate-50 border-b border-border/40 px-4 py-2 flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">
                          Active Batch Candidates ({sessionResumes.length})
                        </span>
                        <button
                          onClick={() => setSessionResumes([])}
                          className="text-[10px] text-danger hover:underline font-bold"
                        >
                          Clear Batch
                        </button>
                      </div>
                      <div className="max-h-40 overflow-y-auto divide-y divide-border/30 px-3">
                        {sessionResumes.map((r) => (
                          <div key={r.id} className="flex items-center justify-between py-2 text-xs">
                            <span className="text-text-primary font-medium truncate max-w-[180px]">{r.filename}</span>
                            <div className="flex gap-1 flex-wrap justify-end">
                              {(r.skills || []).slice(0, 2).map((s) => (
                                <span key={s} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[9px] font-medium border border-slate-200/50">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Run Match Action */}
            <div className="card bg-white border border-border/50 shadow-sm p-6 flex flex-col gap-4">
              <h2 className="font-display font-bold text-lg text-text-primary mb-1">3. Run AI Candidate Matching</h2>
              <p className="text-xs text-text-secondary font-medium -mt-3">
                Match your uploaded active session resumes against the target job position.
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <select
                  className="input-field max-w-xs cursor-pointer"
                  value={sessionJob?.id || selectedJobId || ''}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                >
                  <option value="">Choose Target Job Position</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
                <button
                  className="btn-primary font-semibold shadow-md py-2.5 px-6"
                  onClick={() => runMatch.mutate()}
                  disabled={(!sessionJob && !selectedJobId) || sessionResumes.length === 0 || runMatch.isPending}
                >
                  {runMatch.isPending ? '🤖 Computing Matches...' : '🤖 Match Batch Candidates'}
                </button>
              </div>
            </div>

            {/* Active Match Results Table */}
            {analyses.length > 0 && (
              <div className="card bg-white border border-border/50 shadow-sm p-6 animate-fade-up">
                <div className="flex items-center justify-between border-b border-border/30 pb-3 mb-4 flex-wrap gap-2">
                  <h2 className="font-display font-bold text-lg text-text-primary">
                    Ranked Candidates &mdash; <span className="text-accent">{analysesData?.job_title}</span>
                  </h2>
                  <span className="text-[10px] font-bold text-success bg-green-100/60 px-2 py-0.5 rounded border border-green-200/40">
                    Sorted by AI Match Score
                  </span>
                </div>
                <CandidateRankingsTable analyses={analyses} />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EVALUATED CANDIDATES HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-up">
            <div className="card bg-white border border-border/50 shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-border/30 pb-3 flex-wrap gap-2">
                <div>
                  <h2 className="font-display font-bold text-lg text-text-primary">
                    Evaluated Candidates Registry
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    Select any job position to review historical candidate evaluation reports and match rankings.
                  </p>
                </div>
                {jobs.length > 0 && (
                  <select
                    className="input-field max-w-xs cursor-pointer text-xs"
                    value={selectedJobId || ''}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                    <option value="">Select a Past Job Position</option>
                    {jobs.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-12">
                  <span className="text-4xl block mb-2">📂</span>
                  <p className="text-sm text-text-primary font-bold">No historical evaluations found</p>
                  <p className="text-xs text-text-secondary mt-1">Start a fresh screening run on the main dashboard tab.</p>
                </div>
              ) : !selectedJobId ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-sm font-bold text-text-primary">Please select a job position above to load its evaluated candidate list.</p>
                </div>
              ) : analyses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-text-secondary font-medium">No candidate evaluations generated yet for this job position.</p>
                </div>
              ) : (
                <CandidateRankingsTable analyses={analyses} />
              )}
            </div>
          </div>
        )}
      </div>
    </Shell>
  )
}

function CandidateRankingsTable({ analyses }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead>
          <tr className="border-b border-border text-text-secondary font-semibold">
            <th className="pb-3 pr-4 text-xs">Rank</th>
            <th className="pb-3 pr-4 text-xs">Candidate Name</th>
            <th className="pb-3 pr-4 text-xs">Match Score</th>
            <th className="pb-3 pr-4 text-xs">Skills Coverage</th>
            <th className="pb-3 text-xs text-right">Gaps Alert</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/30">
          {analyses.map((a, i) => {
            const score = Math.round(a.match_score)
            const scoreColor = score >= 75 ? 'text-success' : score >= 50 ? 'text-warning' : 'text-danger'
            const criticalGaps = (a.skill_gaps || []).filter((g) => g.gap_type === 'critical').length
            return (
              <tr key={a.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-3.5 pr-4 text-text-muted font-mono font-bold text-xs">#{i + 1}</td>
                <td className="py-3.5 pr-4 text-text-primary font-bold text-sm">
                  {a.candidate_name || 'Unknown Candidate'}
                </td>
                <td className={`py-3.5 pr-4 font-mono font-bold text-base ${scoreColor}`}>
                  {score}/100
                </td>
                <td className="py-3.5 pr-4">
                  <div className="flex gap-1.5 flex-wrap">
                    {(a.candidate_skills || []).slice(0, 4).map((s) => (
                      <SkillBadge key={s} skill={s} type="present" />
                    ))}
                    {(a.candidate_skills || []).length > 4 && (
                      <span className="text-[10px] text-text-muted self-center ml-1">
                        +{(a.candidate_skills || []).length - 4} more
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-3.5 text-right font-medium">
                  {criticalGaps > 0 ? (
                    <span className="text-danger bg-red-50 border border-red-200/50 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      {criticalGaps} critical gap{criticalGaps > 1 && 's'}
                    </span>
                  ) : (
                    <span className="text-success bg-green-50 border border-green-200/50 px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                      No critical gaps
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function StatCard({ value, label, icon }) {
  return (
    <div className="card bg-white border border-border/50 shadow-sm p-5 flex items-center justify-between">
      <div className="text-left">
        <span className="text-text-muted text-[11px] uppercase tracking-wider font-bold block mb-1">{label}</span>
        <span className="text-3xl font-mono font-bold text-text-primary">{value}</span>
      </div>
      <div className="p-3 bg-slate-100/50 rounded-xl border border-border/30">
        {icon}
      </div>
    </div>
  )
}
