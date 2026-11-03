import { AlertCircle, LoaderCircle, RefreshCw } from 'lucide-react'

function DataState({ isLoading, error, onRetry, title = 'student data' }) {
  if (!isLoading && !error) return null

  if (isLoading) {
    return (
      <div className="panel data-state" role="status">
        <LoaderCircle className="data-state-spinner" size={22} />
        <strong>Loading {title}</strong>
        <span>Connecting to the student directory…</span>
      </div>
    )
  }

  return (
    <div className="panel data-state data-state-error" role="alert">
      <span className="data-state-icon"><AlertCircle size={20} /></span>
      <strong>We couldn’t load {title}</strong>
      <span>{error.message}</span>
      <button className="secondary-button" onClick={onRetry}>
        <RefreshCw size={14} /> Try again
      </button>
    </div>
  )
}

export default DataState
