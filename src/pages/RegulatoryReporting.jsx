import { useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine, LineChart, Line,
} from 'recharts'
import { Download, FileText, CheckCircle, XCircle, Clock, Printer } from 'lucide-react'
import { generateRegulatoryData, generateKpiHistory } from '../data/mockDataGenerator'
import { CustomTooltip, ChartCard } from '../components/charts/ChartComponents'
import { exportMoslSubmission, printReport } from '../utils/exportUtils'

const TABS = ['MOSL', 'Ofwat', 'Water UK', 'Submission History']

function ComplianceRow({ metric }) {
  const isGood = metric.status === 'Compliant' || metric.status === 'Above Benchmark' || metric.status === 'Above Target'
  const isOnTrack = metric.status === 'On Track'
  const isBad = metric.status === 'Non-Compliant'

  const rag = isBad ? 'red' : isOnTrack ? 'amber' : 'green'
  const statusIcon = isBad ? <XCircle size={14} /> : isOnTrack ? <Clock size={14} /> : <CheckCircle size={14} />

  const pct = metric.lowerIsBetter
    ? Math.min(100, (metric.target / metric.value) * 100)
    : Math.min(100, (metric.value / metric.target) * 100)

  return (
    <tr>
      <td style={{ fontWeight: 600, color: 'var(--c-text-primary)', maxWidth: 220 }}>{metric.metric}</td>
      <td className="mono" style={{ fontWeight: 700, fontSize: 15, color: `var(--c-${rag === 'green' ? 'rag-green' : rag === 'red' ? 'rag-red' : 'rag-amber'})` }}>
        {metric.value}{metric.unit}
      </td>
      <td className="mono" style={{ color: 'var(--c-text-muted)' }}>{metric.target}{metric.unit}</td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="progress-bar-container" style={{ width: 80, height: 6 }}>
            <div className={`progress-bar-fill ${rag}`} style={{ width: `${pct}%` }} />
          </div>
          <span className="mono" style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{pct.toFixed(0)}%</span>
        </div>
      </td>
      <td>
        <span className={`rag-badge ${rag}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          {statusIcon}
          {metric.status}
        </span>
      </td>
    </tr>
  )
}

export default function RegulatoryReporting() {
  const [activeTab, setActiveTab] = useState('MOSL')
  const { moslMetrics, ofwatMetrics, waterUkMetrics, submissionHistory } = useMemo(() => generateRegulatoryData(), [])
  const kpiHistory = useMemo(() => generateKpiHistory(), [])

  // MOSL score trend
  const moslTrend = kpiHistory.slice(-12).map(h => ({
    period: h.period.slice(5),
    score: h.moslScore,
    target: 85,
    internal: 90,
  }))

  // Submission history display
  const subHistory = submissionHistory.map(s => ({
    period: s.period,
    mosl: s.mosl.submitted ? (s.mosl.onTime ? '✓ On Time' : '⚠ Late') : '—',
    moslRecords: s.mosl.records?.toLocaleString() || '—',
    ofwat: s.ofwat.submitted ? '✓ Submitted' : '—',
    waterUk: s.waterUk.submitted ? '✓ Submitted' : '—',
    moslStatus: s.mosl.submitted ? (s.mosl.onTime ? 'green' : 'amber') : 'muted',
  }))

  const metrics = activeTab === 'MOSL' ? moslMetrics : activeTab === 'Ofwat' ? ofwatMetrics : waterUkMetrics

  // Bar chart for regulatory metrics
  const barData = metrics.map(m => ({
    name: m.metric.length > 30 ? m.metric.slice(0, 28) + '…' : m.metric,
    actual: m.value,
    target: m.target,
    status: m.status,
  }))

  const compliantCount = metrics.filter(m => m.status !== 'Non-Compliant').length
  const nonCompliantCount = metrics.filter(m => m.status === 'Non-Compliant').length

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Regulatory Reporting</h2>
          <p className="section-subtitle">Performance tracking and submission management for MOSL, Ofwat (PR24), and Water UK regulatory obligations</p>
        </div>
        <div className="btn-group">
          <button id="reg-print-btn" className="btn btn-ghost btn-sm" onClick={() => printReport('Regulatory Report')}>
            <Printer size={14} />
            Print Report
          </button>
          <button id="reg-export-btn" className="btn btn-primary btn-sm" onClick={() => exportMoslSubmission(moslMetrics)}>
            <Download size={14} />
            Export MOSL CSV
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid-4 mb-5">
        {[
          { label: 'MOSL Metrics Compliant', value: `${moslMetrics.filter(m => m.status !== 'Non-Compliant').length}/${moslMetrics.length}`, color: 'var(--c-rag-green)' },
          { label: 'Ofwat KPIs Met', value: `${ofwatMetrics.filter(m => m.status !== 'Non-Compliant').length}/${ofwatMetrics.length}`, color: 'var(--c-chart-2)' },
          { label: 'Submissions On Time', value: `${submissionHistory.filter(s => s.mosl.onTime).length}/12`, color: 'var(--c-brand-primary)' },
          { label: 'Non-Compliant Items', value: [moslMetrics, ofwatMetrics, waterUkMetrics].flat().filter(m => m.status === 'Non-Compliant').length, color: 'var(--c-rag-red)' },
        ].map((s, i) => (
          <div key={i} className="card animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="kpi-label">{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tab navigation */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--c-border)', paddingBottom: 0 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            id={`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px 16px', fontSize: 13, fontWeight: 600,
              color: activeTab === tab ? 'var(--c-brand-primary)' : 'var(--c-text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--c-brand-primary)' : '2px solid transparent',
              marginBottom: -1, fontFamily: 'var(--font-sans)',
              transition: 'all var(--transition-fast)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab !== 'Submission History' ? (
        <>
          {/* Compliance summary banner */}
          <div className={`alert-banner ${nonCompliantCount > 0 ? 'amber' : 'green'} mb-5 animate-in`}>
            {nonCompliantCount > 0
              ? <><FileText size={16} /><strong>{nonCompliantCount} metric{nonCompliantCount > 1 ? 's' : ''} below {activeTab} threshold.</strong> Immediate action required before next submission window.</>
              : <><CheckCircle size={16} /><strong>All {activeTab} metrics are compliant.</strong> Next submission due end of reporting period.</>
            }
          </div>

          <div className="grid-2 mb-5">
            {/* Metrics table */}
            <div className="card animate-in animate-in-2" style={{ overflow: 'hidden' }}>
              <div className="card-header">
                <div className="card-title">{activeTab} Performance Metrics</div>
                <span className={`rag-badge ${nonCompliantCount > 0 ? 'amber' : 'green'}`}>
                  {compliantCount}/{metrics.length} Compliant
                </span>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>Actual</th>
                      <th>Target</th>
                      <th>Progress</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m, i) => <ComplianceRow key={i} metric={m} />)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bar chart */}
            <ChartCard title={`${activeTab} Actual vs. Target`} subtitle="Performance comparison across all regulatory metrics">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={barData} layout="vertical" barSize={10} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(218,20%,22%,0.5)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} width={160} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="target" name="Target" fill="hsla(218,20%,30%,0.8)" radius={[0,4,4,0]} barSize={6} />
                  <Bar dataKey="actual" name="Actual" radius={[0,4,4,0]}>
                    {barData.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.status === 'Non-Compliant' ? 'var(--c-rag-red)'
                          : entry.status === 'On Track' ? 'var(--c-rag-amber)'
                            : 'var(--c-rag-green)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* MOSL score trend (only on MOSL tab) */}
          {activeTab === 'MOSL' && (
            <ChartCard title="MOSL Score Trend (12 Months)" subtitle="Monthly MOSL performance index vs. 85 minimum and 90 internal target" className="animate-in animate-in-4">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={moslTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsla(218,20%,22%,0.5)" vertical={false} />
                  <XAxis dataKey="period" tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} domain={[60, 100]} />
                  <Tooltip content={<CustomTooltip formatter={(v) => v.toFixed(1)} />} />
                  <ReferenceLine y={85} stroke="var(--c-rag-red)" strokeDasharray="4 4" label={{ value: 'MOSL Min 85', fill: 'var(--c-rag-red)', fontSize: 10, position: 'right' }} />
                  <ReferenceLine y={90} stroke="var(--c-rag-amber)" strokeDasharray="4 4" label={{ value: 'Internal 90', fill: 'var(--c-rag-amber)', fontSize: 10, position: 'right' }} />
                  <Line type="monotone" dataKey="score" name="MOSL Score" stroke="var(--c-brand-primary)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          )}
        </>
      ) : (
        /* Submission History */
        <div className="card animate-in">
          <div className="card-header">
            <div>
              <div className="card-title">Submission History</div>
              <div className="card-subtitle">Monthly submission record — MOSL, Ofwat (quarterly), Water UK (bi-annual)</div>
            </div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>MOSL Submission</th>
                  <th>MOSL Records</th>
                  <th>Ofwat (Quarterly)</th>
                  <th>Water UK (Bi-Annual)</th>
                </tr>
              </thead>
              <tbody>
                {subHistory.map(s => (
                  <tr key={s.period}>
                    <td style={{ fontWeight: 600, color: 'var(--c-text-primary)', fontFamily: 'var(--font-mono)' }}>{s.period}</td>
                    <td>
                      <span className={`rag-badge ${s.moslStatus === 'green' ? 'green' : s.moslStatus === 'amber' ? 'amber' : 'blue'}`}>
                        {s.mosl}
                      </span>
                    </td>
                    <td className="mono" style={{ fontSize: 12 }}>{s.moslRecords}</td>
                    <td>
                      {s.ofwat !== '—'
                        ? <span className="rag-badge green">{s.ofwat}</span>
                        : <span style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>—</span>
                      }
                    </td>
                    <td>
                      {s.waterUk !== '—'
                        ? <span className="rag-badge green">{s.waterUk}</span>
                        : <span style={{ color: 'var(--c-text-muted)', fontSize: 12 }}>—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
