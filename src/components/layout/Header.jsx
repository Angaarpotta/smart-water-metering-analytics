import { Download, Printer, RefreshCw } from 'lucide-react'
import { printReport } from '../../utils/exportUtils'

const PAGE_META = {
  '/':                     { title: 'Dashboard',             subtitle: 'Programme overview — KPIs, trends, and alerts at a glance' },
  '/meter-performance':    { title: 'Meter Performance',     subtitle: 'Read rates, data completeness, and source comparison' },
  '/leakage-analysis':     { title: 'Leakage Analysis',      subtitle: 'Anomaly detection, zone heatmap, and alert feed' },
  '/regulatory-reporting': { title: 'Regulatory Reporting',  subtitle: 'MOSL · Ofwat · Water UK — compliance and submission tracker' },
  '/data-quality':         { title: 'Data Quality',          subtitle: 'Validation rules, error log, and data integrity metrics' },
}

export default function Header({ pathname, lastUpdated }) {
  const meta = PAGE_META[pathname] || { title: 'Analytics', subtitle: '' }
  const now = lastUpdated || new Date().toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  return (
    <header className="header">
      <div className="header-left">
        <h1>{meta.title}</h1>
        <p>{meta.subtitle}</p>
      </div>

      <div className="header-right">
        <div className="header-badge">
          <RefreshCw size={12} />
          Updated: {now}
        </div>
        <button
          id="header-print-btn"
          className="btn btn-secondary btn-sm"
          onClick={() => printReport(meta.title)}
          title="Print / Save as PDF"
        >
          <Printer size={14} />
          Print
        </button>
      </div>
    </header>
  )
}
