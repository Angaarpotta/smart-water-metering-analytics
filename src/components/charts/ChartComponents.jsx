/**
 * Custom Recharts Tooltip
 */
export function CustomTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="custom-tooltip">
      <div className="custom-tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div className="custom-tooltip-row" key={i}>
          <div
            className="custom-tooltip-dot"
            style={{ background: entry.color || entry.fill }}
          />
          <span style={{ color: 'var(--c-text-muted)' }}>{entry.name}:</span>
          <span style={{ fontWeight: 600, color: 'var(--c-text-primary)', fontFamily: 'var(--font-mono)' }}>
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

/**
 * Chart wrapper card with title and optional action button
 */
export function ChartCard({ title, subtitle, children, action, className = '' }) {
  return (
    <div className={`card ${className}`}>
      <div className="card-header">
        <div>
          <div className="card-title">{title}</div>
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="chart-container">
        {children}
      </div>
    </div>
  )
}
