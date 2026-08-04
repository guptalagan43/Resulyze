import useToastStore from '../../store/toastStore'

const typeColors = {
  info: 'border-info bg-info/10',
  success: 'border-success bg-success/10',
  error: 'border-danger bg-danger/10',
  warning: 'border-warning bg-warning/10',
}

export default function ToastContainer() {
  const { toasts } = useToastStore()

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`border-l-4 rounded-lg px-4 py-3 text-sm text-text-primary animate-fade-up ${typeColors[t.type] || typeColors.info}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}
