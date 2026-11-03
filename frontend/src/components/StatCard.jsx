import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

function StatCard({ label, value, note, change, icon: Icon, tone }) {
  const isTrend = /^[+-]/.test(change)
  const TrendIcon = change.startsWith('-') ? ArrowDownRight : ArrowUpRight

  return (
    <article className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`}><Icon size={18} strokeWidth={1.8} /></div>
      <div className="stat-card-content">
        <div className="stat-topline"><span>{label}</span><span className="stat-more" aria-hidden="true">•••</span></div>
        <strong className="stat-value">{value}</strong>
        <div className="stat-foot">
          <span className={`stat-change ${isTrend ? (change.startsWith('-') ? 'stat-change-down' : '') : 'stat-change-neutral'}`}>
            {isTrend && <TrendIcon size={14} />}
            {change}
          </span>
          <span className="stat-note">{note}</span>
        </div>
      </div>
    </article>
  )
}

export default StatCard
