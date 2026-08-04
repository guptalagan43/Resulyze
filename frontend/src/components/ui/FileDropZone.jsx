import { useCallback, useState } from 'react'

export default function FileDropZone({ onFiles, multiple = false, accept = '.pdf,.docx,.txt' }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) onFiles(files)
  }, [onFiles])

  const handleClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept
    input.multiple = multiple
    input.onchange = (e) => {
      const files = Array.from(e.target.files)
      if (files.length) onFiles(files)
    }
    input.click()
  }, [onFiles, multiple, accept])

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Drop files here or click to select"
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-150 bg-white ${
        isDragging
          ? 'border-accent bg-accent-dim/20'
          : 'border-[#CBD5E1] hover:border-accent hover:bg-slate-50/50'
      }`}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Figma Info/Upload Icon */}
        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div>
          <p className="text-text-primary font-bold text-sm">
            Click to upload <span className="font-normal text-text-secondary">or drag and drop</span>
          </p>
          <p className="text-text-secondary text-[11px] mt-1 font-medium">
            PDF, DOCX or TXT (max. 10MB)
          </p>
        </div>
      </div>
    </div>
  )
}
