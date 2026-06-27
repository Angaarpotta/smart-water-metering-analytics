import { useMemo, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import { Download, ShieldCheck, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { generateDataQualityIssues, generateKpiHistory } from '../data/mockDataGenerator'
import { ChartCard, CustomTooltip } from '../components/charts/ChartComponents'
import { exportDataQuality } from '../utils/exportUtils'

const ISSUE_TYPES = ['All Types', 'Missing Read', 'Out-of-Range Value', 'Duplicate Record', 'Null Meter ID', 'Future Timestamp', 'Negative Consumption', 'Stale Data']
const SEVERITIES = ['All', 'High', 'Medium', 'Low']
const SOURCES = ['All Sources', 'AMS Provider', 'SOC Direct', 'Manual Entry']

const SEVERITY_COLORS = { High: 'var(--c-critical)', Medium: 'var(--c-medium)', Low: 'var(--c-low)' }
const PIE_COLORS = ['var(--c-chart-1)', 'var(--c-chart-2)', 'var(--c-chart-3)', 'var(--c-chart-4)', 'var(--c-chart-5)', 'var(--c-chart-6)', 'var(--c-rag-green)']

const DQ_RULES = [
  { rule: 'No duplicate meter ID + timestamp pairs', status: 'Pass', check: 'Duplicate Detection', records: 98340 },
  { rule: 'All readings within meter physical range (0–99999)', status: 'Pass', check: 'Range Validation', records: 98340 },
  { rule: 'No null or empty meter IDs', status: 'Fail', check: 'Null Check', records: 12 },
  { rule: 'Timestamps are not in the future', status: 'Pass', check: 'Timestamp Validation', records: 98340 },
  { rule: 'Consumption not negative', status: 'Pass', check: 'Value Validity', records: 98340 },
  { rule: 'Read gap ≤ 48 hours', status: 'Warn', check: 'Timeliness Check', records: 287 },
  { rule: 'Source field is populated', status: 'Pass', check: 'Source Integrity', records: 98340 },
  { rule: 'Meter ID exists in registry', status: 'Pass', check: 'Registry Cross-Check', records: 98340 },
]

export default function DataQuality() {
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [sourceFilter, setSourceFilter] = useState('All Sources')
  const [showResolved, setShowResolved] = useState(false)

  const issues = useMemo(() => generateDataQualityIssues(), [])
  const history = useMemo(() => generateKpiHistory(), [])

  // Filtered issues
  const filtered = issues.filter(i =>
    (typeFilter === 'All Types' || i.type === typeFilter) &&
    (severityFilter === 'All' || i.severity === severityFilter) &&
    (sourceFilter === 'All Sources' || i.source === sourceFilter) &&
    (showResolved || !i.resolved)
  )

  // Issue type breakdown for pie
  const typeCounts = issues.reduce((acc, i) => {
    acc[i.type] = (acc[i.type] || 0) + i.recordsAffected
    return acc
  }, {})
  const pieData = Object.entries(typeCounts).map(([name, value]) => ({ name, value }))

  // Monthly trend
  const monthlyTrend = history.slice(-12).map(h => ({
    period: h.period.slice(5),
    completeness: h.dataCompleteness,
    target: 98,
    internal: 95,
  }))

  // Issues by source
  const sourceCounts = issues.reduce((acc, i) => {
    acc[i.source] = (acc[i.source] || 0) + 1
    return acc
  }, {})
  const sourceBarData = Object.entries(sourceCounts).map(([name, count]) => ({
    source: name.split(' ')[0],
    full: name,
    high: issues.filter(i => i.source === name && i.severity === 'High').length,
    medium: issues.filter(i => i.source === name && i.severity === 'Medium').length,
    low: issues.filter(i => i.source === name && i.severity === 'Low').length,
  }))

  // Summary stats
  const totalRecordsAffected = issues.reduce((s, i) => s + i.recordsAffected, 0)
  const unresolvedCount = issues.filter(i => !i.resolved).length
  const highSeverityCount = issues.filter(i => i.severity === 'High').length
  const dqScore = parseFloat((history[history.length - 1]?.dataCompleteness || 0).toFixed(1))

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Data Quality</h2>
          <p className="section-subtitle">Validation rule outcomes, data integrity metrics, and error log across all meter data sources</p>
        </div>
        <button id="dq-export-btn" className="btn btn-secondary btn-sm" onClick={() => exportDataQuality(issues)}>
          <Download size={14} />
          Export Issues
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid-4 mb-5">
        {[
          { label: 'Data Quality Score', value: `${dqScore}%`, color: dqScore >= 97 ? 'var(--c-rag-green)' : dqScore >= 93 ? 'var(--c-rag-amber)' : 'var(--c-rag-red)', icon: <ShieldCheck size={18} /> },
          { label: 'Unresolved Issues', value: unresolvedCount, color: 'var(--c-rag-red)', icon: <AlertTriangle size={18} /> },
          { label: 'Records Affected', value: totalRecordsAffected.toLocaleString(), color: 'var(--c-rag-amber)', icon: <AlertTriangle size={18} /> },
          { label: 'High-Severity Issues', value: highSeverityCount, color: 'var(--c-critical)', icon: <XCircle size={18} /> },
        ].map((s, i) => (
          <div key={i} className="card animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="kpi-label">{s.label}</div>
              <div style={{ color: s.color, opacity: 0.6 }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Validation Rules Panel */}
      <div className="card mb-5 animate-in animate-in-2">
        <div className="card-header">
          <div className="card-title">Validation Rule Results</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['green', 'Pass'], ['amber', 'Warn'], ['red', 'Fail']].map(([rag, label]) => (
              <span key={label} className={`rag-badge ${rag}`}>{DQ_RULES.filter(r => r.status === label.charAt(0).toUpperCase() + label.slice(1).toLowerCase() || (rag === 'amber' && r.status === 'Warn') || (rag === 'red' && r.status === 'Fail') || (rag === 'green' && r.status === 'Pass')).length} {label}</span>
            ))}
          </div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Check</th>
                <th>Rule</th>
                <th>Records Evaluated</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {DQ_RULES.map((rule, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, color: 'var(--c-text-primary)', fontSize: 12 }}>{rule.check}</td>
                  <td style={{ fontSize: 12 }}>{rule.rule}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{rule.records.toLocaleString()}</td>
                  <td>
                    <span className={`rag-badge ${rule.status === 'Pass' ? 'green' : rule.status === 'Warn' ? 'amber' : 'red'}`}>
                      {rule.status === 'Pass' ? <CheckCircle size={12} /> : rule.status === 'Warn' ? <AlertTriangle size={12} /> : <XCircle size={12} />}
                      {rule.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid-2 mb-5">
        {/* Pie chart - issue type breakdown */}
        <ChartCard title="Issue Type Distribution" subtitle="Records affected by category">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%" cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip formatter={(v) => v.toLocaleString() + ' records'} />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 8 }}>
            {pieData.map((d, i) => (
              <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
                <span style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>{d.name}</span>
              </div>
            ))}
          </div>
        </ChartCard>

        {/* Issues by source */}
        <ChartCard title="Issues by Data Source" subtitle="High/Medium/Low severity breakdown per provider">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={sourceBarData} barSize={18}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(218,20%,22%,0.5)" vertical={false} />
              <XAxis dataKey="source" tick={{ fill: 'var(--c-text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={v => <span style={{ fontSize: 11, color: 'var(--c-text-secondary)' }}>{v}</span>} />
              <Bar dataKey="high" name="High" stackId="a" fill="var(--c-critical)" />
              <Bar dataKey="medium" name="Medium" stackId="a" fill="var(--c-medium)" />
              <Bar dataKey="low" name="Low" stackId="a" fill="var(--c-low)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Issue Log */}
      <div className="card animate-in animate-in-4">
        <div className="card-header">
          <div>
            <div className="card-title">Data Quality Issue Log</div>
            <div className="card-subtitle">Showing {filtered.length} issues</div>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <select id="dq-type-filter" value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={{ fontSize: 12 }}>
              {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
            <select id="dq-sev-filter" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={{ fontSize: 12 }}>
              {SEVERITIES.map(s => <option key={s}>{s}</option>)}
            </select>
            <select id="dq-source-filter" value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} style={{ fontSize: 12 }}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--c-text-muted)', cursor: 'pointer' }}>
              <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} />
              Show Resolved
            </label>
          </div>
        </div>
        <div className="data-table-wrapper" style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Issue ID</th>
                <th>Type</th>
                <th>Meter / Zone</th>
                <th>Source</th>
                <th>Period</th>
                <th>Severity</th>
                <th>Records</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 60).map(issue => (
                <tr key={issue.issueId}>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--c-text-primary)' }}>{issue.issueId}</td>
                  <td style={{ fontSize: 12 }}>{issue.type}</td>
                  <td style={{ fontSize: 12 }}>
                    <div style={{ fontWeight: 600, color: 'var(--c-text-primary)', fontSize: 11 }}>{issue.meterId}</div>
                    <div style={{ fontSize: 10, color: 'var(--c-text-muted)' }}>{issue.zone.split(' - ')[0]}</div>
                  </td>
                  <td style={{ fontSize: 12 }}>{issue.source}</td>
                  <td className="mono" style={{ fontSize: 12 }}>{issue.period}</td>
                  <td><span className={`severity-badge ${issue.severity}`}>{issue.severity}</span></td>
                  <td className="mono" style={{ fontSize: 12 }}>{issue.recordsAffected.toLocaleString()}</td>
                  <td>
                    <span className={`rag-badge ${issue.resolved ? 'green' : 'red'}`}>
                      {issue.resolved ? '✓ Resolved' : 'Open'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 60 && (
          <div style={{ textAlign: 'center', padding: '12px', fontSize: 12, color: 'var(--c-text-muted)' }}>
            Showing 60 of {filtered.length} results. Use Export to get full dataset.
          </div>
        )}
      </div>
    </div>
  )
}
