import { useMemo, useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ComposedChart, Area,
} from 'recharts'
import { Download, Filter } from 'lucide-react'
import { generateDailyReadVolume, generateMeterRegistry, generateZonePerformance } from '../data/mockDataGenerator'
import { CustomTooltip, ChartCard } from '../components/charts/ChartComponents'
import { downloadCSV, toCSV } from '../utils/exportUtils'

const SOURCES = ['All Sources', 'AMS Provider', 'SOC Direct', 'Manual Entry']
const ZONES_FILTER = ['All Zones', 'Zone A - Brighton', 'Zone B - Worthing', 'Zone C - Chichester', 'Zone D - Eastbourne', 'Zone E - Hastings']
const PERIODS = ['Last 7 days', 'Last 30 days', 'Last 90 days']

export default function MeterPerformance() {
  const [source, setSource] = useState('All Sources')
  const [zone, setZone] = useState('All Zones')
  const [period, setPeriod] = useState('Last 30 days')

  const allReads = useMemo(() => generateDailyReadVolume(), [])
  const meters = useMemo(() => generateMeterRegistry(), [])
  const zonePerf = useMemo(() => generateZonePerformance(), [])

  const periodDays = period === 'Last 7 days' ? 7 : period === 'Last 30 days' ? 30 : 90
  const reads = allReads.slice(-periodDays)

  // Aggregated source reads
  const sourceData = reads.map(d => ({
    date: d.date.slice(5),
    AMS: d.amsReads,
    SOC: d.socReads,
    Manual: d.manualReads,
    rate: d.readRate,
    expected: d.expectedReads,
    received: d.readsReceived,
  }))

  // Average stats
  const avgReadRate = (reads.reduce((s, d) => s + d.readRate, 0) / reads.length).toFixed(1)
  const totalReceived = reads.reduce((s, d) => s + d.readsReceived, 0)
  const totalExpected = reads.reduce((s, d) => s + d.expectedReads, 0)
  const overallRate = ((totalReceived / totalExpected) * 100).toFixed(1)

  // Meter status breakdown
  const statusCounts = meters.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1
    return acc
  }, {})
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }))

  // Zone performance table (filterable)
  const filteredZones = zone === 'All Zones' ? zonePerf : zonePerf.filter(z => z.zone === zone)

  // Source breakdown pie-style bar
  const lastRead = reads[reads.length - 1] || {}
  const sourceBreakdown = [
    { source: 'AMS Provider', count: lastRead.amsReads || 0, color: 'var(--c-chart-1)' },
    { source: 'SOC Direct', count: lastRead.socReads || 0, color: 'var(--c-chart-2)' },
    { source: 'Manual Entry', count: lastRead.manualReads || 0, color: 'var(--c-chart-3)' },
  ]

  return (
    <div>
      <div className="section-header">
        <div>
          <h2 className="section-title">Meter Performance</h2>
          <p className="section-subtitle">Read rates, data source analysis, and zone-level performance breakdown</p>
        </div>
        <button
          id="meter-export-btn"
          className="btn btn-secondary btn-sm"
          onClick={() => downloadCSV(toCSV(reads), `Meter_Performance_${new Date().toISOString().slice(0,10)}`)}
        >
          <Download size={14} />
          Export Data
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar mb-5">
        <Filter size={14} style={{ color: 'var(--c-text-muted)' }} />
        <span className="filter-label">Period:</span>
        <select id="period-filter" value={period} onChange={e => setPeriod(e.target.value)}>
          {PERIODS.map(p => <option key={p}>{p}</option>)}
        </select>
        <span className="filter-label">Zone:</span>
        <select id="zone-filter" value={zone} onChange={e => setZone(e.target.value)}>
          {ZONES_FILTER.map(z => <option key={z}>{z}</option>)}
        </select>
        <span className="filter-label">Source:</span>
        <select id="source-filter" value={source} onChange={e => setSource(e.target.value)}>
          {SOURCES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid-4 mb-5">
        {[
          { label: 'Avg Read Rate', value: `${avgReadRate}%`, color: parseFloat(avgReadRate) >= 97 ? 'var(--c-rag-green)' : parseFloat(avgReadRate) >= 94 ? 'var(--c-rag-amber)' : 'var(--c-rag-red)' },
          { label: 'Total Reads Received', value: totalReceived.toLocaleString(), color: 'var(--c-brand-primary)' },
          { label: 'Overall Rate', value: `${overallRate}%`, color: 'var(--c-chart-2)' },
          { label: 'Active Meters', value: meters.filter(m => m.status === 'Active').length, color: 'var(--c-rag-green)' },
        ].map((s, i) => (
          <div key={i} className="card animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className="kpi-label">{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid-2 mb-5">
        {/* Read rate trend */}
        <ChartCard title="Read Rate Trend" subtitle={`Daily read rate % — ${period}`}>
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={sourceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(218,20%,22%,0.5)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.floor(periodDays / 7)} />
              <YAxis tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} domain={[85, 100]} />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
              <Area type="monotone" dataKey="rate" name="Read Rate %" fill="hsla(200,80%,48%,0.1)" stroke="var(--c-chart-1)" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Source breakdown stacked */}
        <ChartCard title="Reads by Data Source" subtitle="AMS Provider, SOC Direct, and Manual Entry contribution">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={sourceData.slice(-Math.min(30, periodDays))} barSize={source === 'All Sources' ? 6 : 8}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(218,20%,22%,0.5)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip formatter={(v) => v.toLocaleString()} />} />
              <Legend formatter={v => <span style={{ fontSize: 11, color: 'var(--c-text-secondary)' }}>{v}</span>} />
              {(source === 'All Sources' || source === 'AMS Provider') && <Bar dataKey="AMS" name="AMS Provider" stackId="a" fill="var(--c-chart-1)" radius={[0,0,0,0]} />}
              {(source === 'All Sources' || source === 'SOC Direct') && <Bar dataKey="SOC" name="SOC Direct" stackId="a" fill="var(--c-chart-2)" />}
              {(source === 'All Sources' || source === 'Manual Entry') && <Bar dataKey="Manual" name="Manual Entry" stackId="a" fill="var(--c-chart-3)" radius={[3,3,0,0]} />}
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Source breakdown visual */}
      <div className="card mb-5 animate-in animate-in-3">
        <div className="card-header">
          <div className="card-title">Today&apos;s Source Split</div>
          <div className="card-subtitle">Most recent read cycle — {reads[reads.length - 1]?.date || 'N/A'}</div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {sourceBreakdown.map(s => {
            const total = sourceBreakdown.reduce((a, b) => a + b.count, 0)
            const pct = ((s.count / total) * 100).toFixed(1)
            return (
              <div key={s.source} style={{ flex: 1, padding: '12px', background: 'var(--c-bg-elevated)', borderRadius: 10, borderLeft: `3px solid ${s.color}` }}>
                <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginBottom: 4 }}>{s.source}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 4 }}>{pct}% of reads</div>
                <div className="progress-bar-container" style={{ marginTop: 8 }}>
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: s.color }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Zone Performance Table */}
      <div className="card animate-in animate-in-4">
        <div className="card-header">
          <div>
            <div className="card-title">Zone Performance Summary</div>
            <div className="card-subtitle">Read rate, consumption, and alerts by geographic zone</div>
          </div>
          <button
            id="zone-export-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => downloadCSV(toCSV(filteredZones), 'Zone_Performance')}
          >
            <Download size={14} /> Export
          </button>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Zone</th>
                <th>Active Meters</th>
                <th>Read Rate</th>
                <th>Avg Consumption</th>
                <th>Leakage Events</th>
                <th>Data Quality</th>
                <th>Open Alerts</th>
              </tr>
            </thead>
            <tbody>
              {filteredZones.map(z => (
                <tr key={z.zone}>
                  <td style={{ fontWeight: 600, color: 'var(--c-text-primary)' }}>{z.zone}</td>
                  <td className="mono">{z.activeMeters}</td>
                  <td>
                    <span className={`rag-badge ${z.readRate >= 97 ? 'green' : z.readRate >= 94 ? 'amber' : 'red'}`}>
                      {z.readRate}%
                    </span>
                  </td>
                  <td className="mono">{z.avgConsumption} L/p/d</td>
                  <td className="mono">{z.leakageEvents}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar-container" style={{ width: 60, height: 6 }}>
                        <div className="progress-bar-fill" style={{ width: `${z.dataQualityScore}%` }} />
                      </div>
                      <span className="mono" style={{ fontSize: 12 }}>{z.dataQualityScore}%</span>
                    </div>
                  </td>
                  <td>
                    {z.alertsOpen > 0
                      ? <span className={`rag-badge ${z.alertsOpen > 8 ? 'red' : z.alertsOpen > 4 ? 'amber' : 'green'}`}>{z.alertsOpen}</span>
                      : <span className="rag-badge green">0</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Meter Status breakdown */}
      <div className="card mt-4 animate-in animate-in-5">
        <div className="card-header">
          <div className="card-title">Meter Status Breakdown</div>
          <div className="card-subtitle">Current status across all {meters.length} registered meters</div>
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {statusData.map(s => {
            const pct = ((s.value / meters.length) * 100).toFixed(1)
            const isIssue = ['Comms Fault', 'Low Battery', 'Tamper Alert'].includes(s.name)
            return (
              <div key={s.name} style={{ flex: '1 1 140px', padding: '12px 14px', background: 'var(--c-bg-elevated)', borderRadius: 10, borderTop: `2px solid ${isIssue ? 'var(--c-rag-amber)' : 'var(--c-rag-green)'}` }}>
                <div style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{s.name}</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: isIssue ? 'var(--c-rag-amber)' : 'var(--c-rag-green)', margin: '4px 0' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{pct}% of fleet</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
