import { useEffect } from 'react'
import { CheckCircle2, CircleAlert, X } from 'lucide-react'

function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(onDismiss, 3800)
    return () => window.clearTimeout(timeout)
  }, [toast, onDismiss])

  if (!toast) return null

  const Icon = toast.type === 'error' ? CircleAlert : CheckCircle2
  return (
    <div className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'} key={toast.id}>
      <Icon size={18} aria-hidden="true" />
      <span>{toast.message}</span>
      <button className="icon-button toast-close" onClick={onDismiss} aria-label="Dismiss notification">
        <X size={16} />
      </button>
    </div>
  )
}

export default Toast
