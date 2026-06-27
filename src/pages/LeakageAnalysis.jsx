import { useMemo, useState } from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ComposedChart, Line, Area, ReferenceLine, BarChart, Bar,
} from 'recharts'
import { AlertTriangle, Download, Droplets, TrendingDown } from 'lucide-react'
import { generateLeakageEvents, generateZonePerformance } from '../data/mockDataGenerator'
import { generateConsumptionTimeSeries, summariseLeakageByZone } from '../utils/anomalyDetection'
import { CustomTooltip, ChartCard } from '../components/charts/ChartComponents'
import { exportLeakageEvents } from '../utils/exportUtils'

const SEVERITY_ORDER = ['Critical', 'High', 'Medium', 'Low']
const SEVERITY_COLORS = {
  Critical: 'var(--c-critical)',
  High: 'var(--c-high)',
  Medium: 'var(--c-medium)',
  Low: 'var(--c-low)',
}

function AlertRow({ event }) {
  return (
    <tr>
      <td>
        <div style={{ fontWeight: 600, color: 'var(--c-text-primary)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{event.eventId}</div>
        <div style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{event.meterId}</div>
      </td>
      <td style={{ fontSize: 12 }}>{event.zone.replace('Zone ', '')}</td>
      <td style={{ fontSize: 12 }}>{event.type}</td>
      <td><span className={`severity-badge ${event.severity}`}>{event.severity}</span></td>
      <td><span className={`rag-badge ${event.status === 'Resolved' ? 'green' : event.status === 'In Progress' ? 'amber' : 'red'}`}>{event.status}</span></td>
      <td className="mono" style={{ fontSize: 12 }}>{parseFloat(event.zScore).toFixed(2)}σ</td>
      <td className="mono" style={{ fontSize: 12 }}>{event.estimatedVolumeLitres.toLocaleString()} L</td>
      <td style={{ fontSize: 12 }}>{event.detectionDate}</td>
    </tr>
  )
}

export default function LeakageAnalysis() {
  const [selectedMeter, setSelectedMeter] = useState('SW00042')
  const [severityFilter, setSeverityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [zoneFilter, setZoneFilter] = useState('All')

  const events = useMemo(() => generateLeakageEvents(), [])
  const zoneSummary = useMemo(() => summariseLeakageByZone(events), [events])
  const consumption = useMemo(() => generateConsumptionTimeSeries(selectedMeter), [selectedMeter])

  // Filter events
  const filtered = events.filter(e =>
    (severityFilter === 'All' || e.severity === severityFilter) &&
    (statusFilter === 'All' || e.status === statusFilter) &&
    (zoneFilter === 'All' || e.zone === zoneFilter)
  )

  // Stats
  const openCritical = events.filter(e => e.severity === 'Critical' && e.status !== 'Resolved').length
  const totalVolume = events.reduce((s, e) => s + e.estimatedVolumeLitres, 0)
  const avgZScore = (events.reduce((s, e) => s + e.zScore, 0) / events.length).toFixed(2)
  const resolvedPct = ((events.filter(e => e.status === 'Resolved').length / events.length) * 100).toFixed(0)

  // Consumption chart data
  const consumptionChart = consumption.map(d => ({
    date: d.date.slice(5),
    consumption: d.consumption,
    rollingAvg: d.rollingAvg,
    isAnomaly: d.isAnomaly,
    zScore: d.zScore,
    anomalyMark: d.isAnomaly ? d.consumption : null,
  }))

  // Anomaly scatter (z-score vs volume)
  const scatterData = events.map(e => ({
    x: e.zScore,
    y: e.estimatedVolumeLitres,
    name: e.eventId,
    severity: e.severity,
  }))

  // Zone bar chart
  const zoneChart = zoneSummary.map(z => ({
    zone: z.zone.split(' - ')[0],
    Critical: z.critical,
    High: z.high,
    Medium: z.medium,
    Low: z.low,
    volume: z.totalVolume,
  }))

  const zones = [...new Set(events.map(e => e.zone))]

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Leakage Analysis</h2>
          <p className="section-subtitle">Anomaly detection using Z-score statistical analysis — sustained high-flow, overnight spikes, and step-changes in consumption profiles</p>
        </div>
        <button id="leakage-export-btn" className="btn btn-secondary btn-sm" onClick={() => exportLeakageEvents(events)}>
          <Download size={14} />
          Export Events
        </button>
      </div>

      {/* Critical alert */}
      {openCritical > 0 && (
        <div className="alert-banner red animate-in">
          <AlertTriangle size={16} />
          <strong>{openCritical} Critical leakage event{openCritical > 1 ? 's' : ''} require immediate attention.</strong>
          &nbsp;Estimated combined volume loss: {Math.round(events.filter(e => e.severity === 'Critical' && e.status !== 'Resolved').reduce((s, e) => s + e.estimatedVolumeLitres, 0)).toLocaleString()} L
        </div>
      )}

      {/* Summary KPIs */}
      <div className="grid-4 mb-5">
        {[
          { label: 'Total Events Detected', value: events.length, icon: <Droplets size={18} />, color: 'var(--c-chart-1)' },
          { label: 'Critical & Unresolved', value: openCritical, icon: <AlertTriangle size={18} />, color: 'var(--c-critical)' },
          { label: 'Est. Volume Loss', value: `${(totalVolume / 1000).toFixed(1)}k L`, icon: <TrendingDown size={18} />, color: 'var(--c-rag-amber)' },
          { label: 'Resolution Rate', value: `${resolvedPct}%`, icon: <Droplets size={18} />, color: 'var(--c-rag-green)' },
        ].map((s, i) => (
          <div key={i} className="card animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div className="kpi-label">{s.label}</div>
              <div style={{ color: s.color, opacity: 0.7 }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: s.color, marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Consumption time-series with anomaly overlay */}
      <div className="card mb-5 animate-in animate-in-2">
        <div className="card-header">
          <div>
            <div className="card-title">Consumption Anomaly Detection — Meter {selectedMeter}</div>
            <div className="card-subtitle">90-day consumption vs. 7-day rolling average · Flagged anomalies highlighted (Z-score ≥ 2.5)</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: 'var(--c-text-muted)' }}>Meter:</span>
            <input
              id="meter-select-input"
              type="text"
              value={selectedMeter}
              onChange={e => setSelectedMeter(e.target.value.toUpperCase())}
              style={{ width: 100 }}
              placeholder="SW00042"
            />
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <ComposedChart data={consumptionChart}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsla(218,20%,22%,0.5)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} interval={6} />
            <YAxis tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} unit=" L" />
            <Tooltip content={<CustomTooltip formatter={(v, n) => n === 'Consumption' ? `${v} L` : n === 'Anomaly' ? `⚠ ${v} L` : `${v} L`} />} />
            <Area type="monotone" dataKey="consumption" name="Consumption" fill="hsla(200,80%,48%,0.08)" stroke="var(--c-chart-1)" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="rollingAvg" name="7d Rolling Avg" stroke="var(--c-chart-2)" strokeWidth={2} dot={false} strokeDasharray="5 3" />
            <Scatter dataKey="anomalyMark" name="Anomaly" fill="var(--c-rag-red)" shape="triangle" />
            <ReferenceLine y={200} stroke="hsla(0,74%,56%,0.3)" strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
          {[
            { color: 'var(--c-chart-1)', label: 'Daily Consumption' },
            { color: 'var(--c-chart-2)', label: '7-Day Rolling Average', dash: true },
            { color: 'var(--c-rag-red)', label: 'Anomaly Detected (Z ≥ 2.5)' },
          ].map(l => (
            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 20, height: 2, background: l.color, borderRadius: 2, borderTop: l.dash ? '2px dashed' : 'none', borderColor: l.color }} />
              <span style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Zone heatmap + scatter */}
      <div className="grid-2 mb-5">
        {/* Zone leakage bar */}
        <ChartCard title="Events by Zone & Severity" subtitle="Distribution of detected leakage events across geographic zones">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={zoneChart} layout="vertical" barSize={12}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(218,20%,22%,0.5)" horizontal={false} />
              <XAxis type="number" tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis type="category" dataKey="zone" tick={{ fill: 'var(--c-text-muted)', fontSize: 11 }} tickLine={false} axisLine={false} width={55} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Critical" stackId="a" fill="var(--c-critical)" name="Critical" />
              <Bar dataKey="High" stackId="a" fill="var(--c-high)" name="High" />
              <Bar dataKey="Medium" stackId="a" fill="var(--c-medium)" name="Medium" />
              <Bar dataKey="Low" stackId="a" fill="var(--c-low)" name="Low" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Z-Score vs Volume scatter */}
        <ChartCard title="Z-Score vs. Estimated Volume Loss" subtitle="Severity classification by statistical deviation and water loss">
          <ResponsiveContainer width="100%" height={240}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(218,20%,22%,0.5)" />
              <XAxis dataKey="x" name="Z-Score" type="number" tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: 'Z-Score (σ)', position: 'insideBottom', offset: -5, fill: 'var(--c-text-muted)', fontSize: 10 }} />
              <YAxis dataKey="y" name="Volume (L)" type="number" tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} label={{ value: 'Est. Volume (L)', angle: -90, position: 'insideLeft', fill: 'var(--c-text-muted)', fontSize: 10 }} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                if (!active || !payload?.length) return null
                const d = payload[0].payload
                return (
                  <div className="custom-tooltip">
                    <div className="custom-tooltip-label">{d.name}</div>
                    <div className="custom-tooltip-row">Z-Score: <strong style={{ fontFamily: 'var(--font-mono)' }}>{d.x}σ</strong></div>
                    <div className="custom-tooltip-row">Volume: <strong style={{ fontFamily: 'var(--font-mono)' }}>{d.y.toLocaleString()} L</strong></div>
                    <div className="custom-tooltip-row">Severity: <span className={`severity-badge ${d.severity}`} style={{ marginLeft: 4 }}>{d.severity}</span></div>
                  </div>
                )
              }} />
              {SEVERITY_ORDER.map(sev => (
                <Scatter
                  key={sev}
                  name={sev}
                  data={scatterData.filter(d => d.severity === sev)}
                  fill={SEVERITY_COLORS[sev]}
                  opacity={0.8}
                  r={4}
                />
              ))}
              <ReferenceLine x={2.5} stroke="var(--c-rag-amber)" strokeDasharray="4 4" label={{ value: 'Threshold', fill: 'var(--c-rag-amber)', fontSize: 9 }} />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Alert Feed Table */}
      <div className="card animate-in animate-in-4">
        <div className="card-header">
          <div>
            <div className="card-title">Leakage Alert Feed</div>
            <div className="card-subtitle">Showing {filtered.length} of {events.length} events</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select id="severity-filter-leakage" value={severityFilter} onChange={e => setSeverityFilter(e.target.value)} style={{ fontSize: 12 }}>
              <option>All</option>
              {SEVERITY_ORDER.map(s => <option key={s}>{s}</option>)}
            </select>
            <select id="status-filter-leakage" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontSize: 12 }}>
              <option>All</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <select id="zone-filter-leakage" value={zoneFilter} onChange={e => setZoneFilter(e.target.value)} style={{ fontSize: 12 }}>
              <option>All</option>
              {zones.map(z => <option key={z}>{z}</option>)}
            </select>
          </div>
        </div>
        <div className="data-table-wrapper" style={{ maxHeight: 400, overflowY: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Event ID / Meter</th>
                <th>Zone</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Status</th>
                <th>Z-Score</th>
                <th>Est. Volume</th>
                <th>Detected</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map(e => <AlertRow key={e.eventId} event={e} />)}
            </tbody>
          </table>
        </div>
        {filtered.length > 50 && (
          <div style={{ textAlign: 'center', padding: '12px', fontSize: 12, color: 'var(--c-text-muted)' }}>
            Showing 50 of {filtered.length} results. Export CSV for full dataset.
          </div>
        )}
      </div>
    </div>
  )
}
