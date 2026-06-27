import { useMemo } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Legend, RadialBarChart,
  RadialBar, PolarAngleAxis,
} from 'recharts'
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Download } from 'lucide-react'
import { generateKpiHistory, generateKpiTargets, generateDailyReadVolume } from '../data/mockDataGenerator'
import { buildKpiSummary } from '../utils/kpiCalculator'
import { exportKpiHistory } from '../utils/exportUtils'
import { CustomTooltip, ChartCard } from '../components/charts/ChartComponents'

// ── Helpers ─────────────────────────────────────────────────
function TrendIcon({ trend, lowerIsBetter }) {
  if (Math.abs(trend) < 0.1) return <Minus size={14} />
  const isGood = lowerIsBetter ? trend < 0 : trend > 0
  return trend > 0
    ? <TrendingUp size={14} style={{ color: isGood ? 'var(--c-rag-green)' : 'var(--c-rag-red)' }} />
    : <TrendingDown size={14} style={{ color: isGood ? 'var(--c-rag-green)' : 'var(--c-rag-red)' }} />
}

function KpiCard({ kpi, delay }) {
  const isNegative = kpi.trend < -0.05
  const isPositive = kpi.trend > 0.05

  return (
    <div className={`kpi-card rag-${kpi.rag} animate-in animate-in-${delay}`}>
      <div className="kpi-label">{kpi.label}</div>
      <div className={`kpi-value rag-${kpi.rag}`}>
        {kpi.value}<span className="kpi-unit">{kpi.unit}</span>
      </div>
      <div className="kpi-footer">
        <div className="kpi-target">
          Target: {kpi.target ?? '—'}{kpi.unit} {kpi.regulatoryTarget ? `| Reg: ${kpi.regulatoryTarget}${kpi.unit}` : ''}
        </div>
        <div className={`kpi-trend ${isPositive ? 'up' : isNegative ? 'down' : 'flat'}${kpi.lowerIsBetter ? ' lower-is-better' : ''}`}>
          <TrendIcon trend={kpi.trend} lowerIsBetter={kpi.lowerIsBetter} />
          {Math.abs(kpi.trend)}%
        </div>
      </div>
    </div>
  )
}

// ── Gauge for Rollout ────────────────────────────────────────
function RolloutGauge({ value }) {
  const data = [{ value, fill: 'url(#gaugeGrad)' }]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <ResponsiveContainer width="100%" height={200}>
        <RadialBarChart
          cx="50%" cy="65%"
          innerRadius="60%" outerRadius="90%"
          startAngle={180} endAngle={0}
          data={data}
          barSize={20}
        >
          <defs>
            <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(200,80%,48%)" />
              <stop offset="100%" stopColor="hsl(162,65%,45%)" />
            </linearGradient>
          </defs>
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background dataKey="value" cornerRadius={8} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div style={{ marginTop: '-40px', textAlign: 'center' }}>
        <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--c-brand-primary)' }}>{value}%</div>
        <div style={{ fontSize: '12px', color: 'var(--c-text-muted)', marginTop: '4px' }}>Rollout Complete</div>
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────
export default function Dashboard() {
  const history = useMemo(() => generateKpiHistory(), [])
  const targets = useMemo(() => generateKpiTargets(), [])
  const dailyReads = useMemo(() => generateDailyReadVolume(), [])
  const kpis = useMemo(() => buildKpiSummary(history, targets), [history, targets])

  const latest = history[history.length - 1]

  // Last 12 months for bar chart
  const kpiTrend = history.slice(-12).map(h => ({
    period: h.period.slice(5), // MM
    readRate: h.readRate,
    target: 97,
    moslScore: h.moslScore,
  }))

  // Last 30 days for read volume
  const recentReads = dailyReads.slice(-30).map(d => ({
    date: d.date.slice(5), // MM-DD
    reads: d.readsReceived,
    target: 500,
    rate: d.readRate,
    ams: d.amsReads,
    soc: d.socReads,
    manual: d.manualReads,
  }))

  // Consumption trend (12 months)
  const consumptionTrend = history.slice(-12).map(h => ({
    period: h.period.slice(5),
    consumption: h.avgDailyConsumption,
    target: targets.avgDailyConsumption.ofwat,
    internal: targets.avgDailyConsumption.internal,
  }))

  const ragCounts = kpis.reduce((acc, k) => {
    acc[k.rag] = (acc[k.rag] || 0) + 1
    return acc
  }, {})

  return (
    <div>
      {/* Alert if any KPIs are red */}
      {ragCounts.red > 0 && (
        <div className="alert-banner red animate-in">
          <AlertTriangle size={16} />
          <span><strong>{ragCounts.red} KPI{ragCounts.red > 1 ? 's' : ''}</strong> below regulatory threshold. Review Timely Submission and address open alerts.</span>
        </div>
      )}

      {/* KPI Summary */}
      <div className="section-header">
        <div>
          <h2 className="section-title">Programme Overview</h2>
          <p className="section-subtitle">Reporting period: {latest.period} · Smart Metering Programme — Southern Water</p>
        </div>
        <button id="dashboard-export-btn" className="btn btn-secondary btn-sm" onClick={() => exportKpiHistory(history)}>
          <Download size={14} />
          Export KPI History
        </button>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid mb-6">
        {kpis.map((kpi, i) => (
          <KpiCard key={kpi.id} kpi={kpi} delay={i + 1} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid-2 mb-5">
        {/* Daily Read Volume */}
        <ChartCard
          title="Daily Meter Read Volume"
          subtitle="Last 30 days — reads received vs. 500 expected"
          action={
            <div className="flex gap-2">
              {['AMS', 'SOC', 'Manual'].map((s, i) => (
                <span key={s} className="chip" style={{ fontSize: '10px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: ['var(--c-chart-1)', 'var(--c-chart-2)', 'var(--c-chart-3)'][i], display: 'inline-block', marginRight: 4 }} />
                  {s}
                </span>
              ))}
            </div>
          }
        >
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={recentReads} barSize={8} barGap={1}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(218,20%,22%,0.5)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} domain={[430, 510]} />
              <Tooltip content={<CustomTooltip formatter={(v) => v.toLocaleString()} />} />
              <ReferenceLine y={500} stroke="var(--c-rag-amber)" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Target', fill: 'var(--c-rag-amber)', fontSize: 10 }} />
              <Bar dataKey="ams" name="AMS" stackId="a" fill="var(--c-chart-1)" radius={[0,0,0,0]} />
              <Bar dataKey="soc" name="SOC" stackId="a" fill="var(--c-chart-2)" />
              <Bar dataKey="manual" name="Manual" stackId="a" fill="var(--c-chart-3)" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Rollout Gauge + Meters Installed */}
        <ChartCard title="Smart Meter Rollout Progress" subtitle="Installation programme — 500 properties in scope">
          <RolloutGauge value={latest.rolloutPercent} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '8px' }}>
            {[
              { label: 'Installed', value: latest.metersInstalled, color: 'var(--c-brand-primary)' },
              { label: 'Remaining', value: 500 - latest.metersInstalled, color: 'var(--c-text-muted)' },
              { label: 'Active Alerts', value: latest.activeAlerts, color: 'var(--c-rag-amber)' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '8px', background: 'var(--c-bg-elevated)', borderRadius: 8 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: 'var(--c-text-muted)', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Charts Row 2 */}
      <div className="grid-2 mb-5">
        {/* Read Rate 12-month trend */}
        <ChartCard title="Read Rate vs. Target (12 Months)" subtitle="Monthly meter read rate % against Ofwat 97% threshold">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={kpiTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(218,20%,22%,0.5)" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} domain={[80, 100]} />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v}%`} />} />
              <ReferenceLine y={97} stroke="var(--c-rag-amber)" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Ofwat 97%', fill: 'var(--c-rag-amber)', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={95} stroke="hsla(218,20%,40%,0.6)" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Internal 95%', fill: 'var(--c-text-muted)', fontSize: 9, position: 'right' }} />
              <Line type="monotone" dataKey="readRate" name="Read Rate %" stroke="var(--c-chart-1)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--c-chart-1)' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Per-capita consumption */}
        <ChartCard title="Avg. Daily Consumption (L/p/d)" subtitle="Per-capita consumption vs. Ofwat 140 L/p/d target">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={consumptionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(218,20%,22%,0.5)" vertical={false} />
              <XAxis dataKey="period" tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: 'var(--c-text-muted)', fontSize: 10 }} tickLine={false} axisLine={false} domain={[100, 160]} />
              <Tooltip content={<CustomTooltip formatter={(v) => `${v} L`} />} />
              <ReferenceLine y={140} stroke="var(--c-rag-red)" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: 'Ofwat 140L', fill: 'var(--c-rag-red)', fontSize: 10, position: 'right' }} />
              <ReferenceLine y={130} stroke="var(--c-rag-amber)" strokeDasharray="3 3" strokeWidth={1} label={{ value: 'Internal 130L', fill: 'var(--c-rag-amber)', fontSize: 9, position: 'right' }} />
              <Line type="monotone" dataKey="consumption" name="Consumption L/p/d" stroke="var(--c-chart-2)" strokeWidth={2.5} dot={{ r: 3, fill: 'var(--c-chart-2)' }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* KPI category summary */}
      <div className="card animate-in animate-in-5">
        <div className="card-header">
          <div className="card-title">KPI Health Summary</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {[['green', 'On Target'], ['amber', 'Near Miss'], ['red', 'Below Threshold'], ['blue', 'Informational']].map(([rag, label]) => (
              ragCounts[rag] ? (
                <span key={rag} className={`rag-badge ${rag}`}>
                  {ragCounts[rag]} {label}
                </span>
              ) : null
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px' }}>
          {kpis.map(kpi => (
            <div key={kpi.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: 'var(--c-bg-elevated)', borderRadius: 8 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text-primary)' }}>{kpi.label}</div>
                <div style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{kpi.category}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className={`rag-badge ${kpi.rag}`}>
                  {kpi.value}{kpi.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
