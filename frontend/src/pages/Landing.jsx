import { Link } from 'react-router-dom'
import Shell from '../components/layout/Shell'

export default function Landing() {
  return (
    <Shell>
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center py-12">
        <div className="animate-fade-up max-w-3xl">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 tracking-tight text-text-primary leading-tight">
            Smart feedback for your{' '}
            <span className="bg-gradient-to-r from-accent via-[#00D37F] to-accent bg-clip-text text-transparent">
              dream job
            </span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-3 font-medium">
            Analyze your resume against any job description in seconds.
          </p>
          <p className="text-text-secondary/80 max-w-xl mx-auto mb-10 text-sm leading-relaxed">
            Get instant AI-powered match scores, detailed layout review, skills gap lists, and recommended learning resources to boost your ATS pass rate.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <Link to="/check" className="btn-primary text-base !py-3 !px-8 shadow-md">
            Check My Resume &rarr;
          </Link>
          <Link to="/login" className="text-base !py-3 !px-8 shadow-sm bg-white hover:bg-slate-50 text-text-primary font-medium rounded-lg border-2 border-slate-300 hover:border-accent transition-all duration-150">
            Recruiter Login
          </Link>
        </div>

        {/* How It Works — Professional 3-Step Timeline */}
        <div className="mt-24 w-full max-w-5xl animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-text-primary mb-2 tracking-tight">
            How It Works
          </h2>
          <p className="text-text-secondary text-sm mb-12 max-w-lg mx-auto">
            Three simple steps to a better resume — powered by AI.
          </p>

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-10 md:gap-0">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-8 left-[16.67%] right-[16.67%] h-[2px] bg-gradient-to-r from-accent/20 via-accent/40 to-accent/20 z-0" />

            {[
              {
                step: '01',
                title: 'Upload Your Resume',
                desc: 'Drop your PDF, DOCX, or TXT file — our NLP parser extracts every detail in seconds.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                ),
              },
              {
                step: '02',
                title: 'AI-Powered Analysis',
                desc: 'Sentence embeddings and weighted scoring evaluate your resume against the job description.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                step: '03',
                title: 'Get Actionable Results',
                desc: 'Receive detailed scores, skill gap lists, rewrite suggestions, and a personalized improvement checklist.',
                icon: (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
            ].map((item, idx) => (
              <div key={item.step} className="flex-1 flex flex-col items-center text-center relative z-10 group">
                {/* Numbered Circle */}
                <div className="w-16 h-16 rounded-full bg-white border-2 border-accent/20 group-hover:border-accent shadow-sm group-hover:shadow-md flex items-center justify-center mb-5 transition-all duration-300">
                  <div className="w-12 h-12 rounded-full bg-accent-dim text-accent flex items-center justify-center transition-colors duration-300 group-hover:bg-accent group-hover:text-white">
                    {item.icon}
                  </div>
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-accent/60 mb-1.5 font-mono">
                  Step {item.step}
                </span>
                <h3 className="font-display text-base font-bold text-text-primary mb-2">
                  {item.title}
                </h3>
                <p className="text-text-secondary text-xs leading-relaxed max-w-[240px]">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Stats Bar */}
        <div className="mt-20 w-full max-w-4xl animate-fade-up" style={{ animationDelay: '0.45s' }}>
          <div className="bg-white/70 backdrop-blur-sm border border-border/50 rounded-2xl px-8 py-6 shadow-sm flex flex-col sm:flex-row items-center justify-around gap-6">
            {[
              { value: '10,000+', label: 'Resumes Analyzed' },
              { value: '85%', label: 'Avg. Score Improvement' },
              { value: '200+', label: 'Companies Trust Us' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="text-2xl md:text-3xl font-display font-bold text-accent tracking-tight block">
                  {stat.value}
                </span>
                <span className="text-xs text-text-secondary font-medium mt-1 block">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
  )
}
