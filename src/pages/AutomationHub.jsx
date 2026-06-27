import React from 'react'
import { Link } from 'react-router-dom'
import {
  Workflow,
  BrainCircuit,
  ShieldAlert,
  Clock,
  TrendingUp,
  GitBranch,
  Layers,
  ArrowRight,
  Code
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts'

// Mock CoE Metrics
const performanceHistory = [
  { month: 'Jan', n8n: 12, powerPlatform: 34, logicApps: 10, hoursSaved: 120 },
  { month: 'Feb', n8n: 18, powerPlatform: 38, logicApps: 12, hoursSaved: 160 },
  { month: 'Mar', n8n: 29, powerPlatform: 42, logicApps: 15, hoursSaved: 230 },
  { month: 'Apr', n8n: 45, powerPlatform: 46, logicApps: 18, hoursSaved: 380 },
  { month: 'May', n8n: 68, powerPlatform: 50, logicApps: 22, hoursSaved: 540 },
  { month: 'Jun', n8n: 95, powerPlatform: 54, logicApps: 25, hoursSaved: 720 },
]

const platformData = [
  { name: 'n8n Workflows', value: 95, color: 'var(--c-brand-primary)', desc: 'Code-based, high performance' },
  { name: 'Power Apps/Automate', value: 54, color: 'var(--c-brand-secondary)', desc: 'Standard business forms/approvals' },
  { name: 'Azure Logic Apps', value: 25, color: 'var(--c-brand-accent)', desc: 'Enterprise systemic integrations' },
  { name: 'Legacy RPA (Desktop)', value: 12, color: 'var(--c-rag-amber)', desc: 'Legacy UI automation (UIPath)' },
]

const recentDeployments = [
  { id: 'DEP-104', flow: 'Smart Meter Data Quality Sync', platform: 'n8n', status: 'Success', version: 'v2.1.0', time: '10 mins ago', author: 'Janba (Platform Eng)' },
  { id: 'DEP-103', flow: 'DMA Leakage Notification Webhook', platform: 'n8n', status: 'Success', version: 'v1.4.2', time: '1 hour ago', author: 'Janba (Platform Eng)' },
  { id: 'DEP-102', flow: 'Ofwat Compliance Submission Flow', platform: 'Power Automate', status: 'Pending Approval', version: 'v1.0.0', time: '3 hours ago', author: 'Sara L.' },
  { id: 'DEP-101', flow: 'Azure Key Vault secret auto-rotate', platform: 'Logic Apps', status: 'Success', version: 'v3.0.1', time: 'Yesterday', author: 'System' },
]

export default function AutomationHub() {
  return (
    <div className="animate-in flex flex-col gap-5">
      {/* Overview Banner */}
      <div className="alert-banner blue">
        <div>
          <strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>
            Automation Platform Strategy — n8n Powered CoE
          </strong>
          Southern Water is transitioning to an API-led, code-first automation architecture. By prioritizing **n8n** alongside Azure Integration Services, we enable flexible deployment (self-hosted in secure Azure VNETs), robust Git-based version control, and native JavaScript/Python capabilities that lower overhead and simplify citizen-developer handoffs.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card rag-blue">
          <div className="kpi-label">Active Automations</div>
          <div className="kpi-value rag-blue">
            186 <span className="kpi-unit">flows</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-target">Target: 200 by Q3</span>
            <span className="kpi-trend up">
              <TrendingUp size={14} /> +24% MoM
            </span>
          </div>
        </div>

        <div className="kpi-card rag-green">
          <div className="kpi-label">Estimated Hours Saved</div>
          <div className="kpi-value rag-green">
            720 <span className="kpi-unit">hrs/mo</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-target">FTE Value: ~4.5 FTE</span>
            <span className="kpi-trend up">
              <TrendingUp size={14} /> +18% MoM
            </span>
          </div>
        </div>

        <div className="kpi-card rag-amber">
          <div className="kpi-label">AI Adaptation Rate</div>
          <div className="kpi-value rag-amber">
            68% <span className="kpi-unit">adoption</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-target">Active Copilot Users</span>
            <span className="kpi-trend up">
              <TrendingUp size={14} /> +12% MoM
            </span>
          </div>
        </div>

        <div className="kpi-card rag-green">
          <div className="kpi-label">DLP & Governance</div>
          <div className="kpi-value rag-green">
            100% <span className="kpi-unit">compliant</span>
          </div>
          <div className="kpi-footer">
            <span className="kpi-target">No DLP Violations</span>
            <span className="kpi-trend flat">Secure</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid-2-1">
        {/* Growth Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Automation Scaling & Hours Saved</div>
              <div className="card-subtitle">Showing rapid scaling since n8n deployment in March</div>
            </div>
            <div className="chip">Monthly metrics</div>
          </div>
          <div className="chart-container" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="n8nGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--c-brand-primary)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--c-brand-primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--c-brand-accent)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--c-brand-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }} />
                <Area type="monotone" dataKey="n8n" name="n8n Workflows" stroke="var(--c-brand-primary)" fillOpacity={1} fill="url(#n8nGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="hoursSaved" name="Hours Saved" stroke="var(--c-brand-accent)" fillOpacity={1} fill="url(#hoursGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Share */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Platform Distribution</div>
              <div className="card-subtitle">By active production workflow</div>
            </div>
          </div>
          <div className="flex flex-col gap-4 mt-2">
            {platformData.map((platform) => (
              <div key={platform.name} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="flex items-center gap-2">
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: platform.color }} />
                    <strong>{platform.name}</strong>
                  </span>
                  <span className="mono font-semibold">{platform.value}</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${(platform.value / 186) * 100}%`, backgroundColor: platform.color, backgroundImage: 'none' }} 
                  />
                </div>
                <span style={{ fontSize: '10px', color: 'var(--c-text-muted)', marginLeft: '18px' }}>
                  {platform.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deployment & DevOps pipeline details */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Recent CoE Deployments & DevOps Pipelines</div>
            <div className="card-subtitle">Fully versioned and deployed through automated CI/CD pipelines</div>
          </div>
          <Link to="/platform-governance" className="btn btn-secondary btn-sm">
            Configure DevOps <ArrowRight size={14} />
          </Link>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Workflow Name</th>
                <th>Platform</th>
                <th>Release</th>
                <th>Owner</th>
                <th>Triggered</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentDeployments.map((dep) => (
                <tr key={dep.id}>
                  <td className="mono">{dep.id}</td>
                  <td>
                    <strong>{dep.flow}</strong>
                  </td>
                  <td>
                    <span className="chip" style={{ 
                      backgroundColor: dep.platform === 'n8n' ? 'hsla(200, 80%, 48%, 0.15)' : 'var(--c-bg-elevated)',
                      color: dep.platform === 'n8n' ? 'var(--c-brand-primary)' : 'var(--c-text-secondary)',
                      borderColor: dep.platform === 'n8n' ? 'hsla(200, 80%, 48%, 0.3)' : 'var(--c-border)'
                    }}>
                      {dep.platform}
                    </span>
                  </td>
                  <td className="mono">{dep.version}</td>
                  <td>{dep.author}</td>
                  <td>{dep.time}</td>
                  <td>
                    <span className={`rag-badge ${dep.status === 'Success' ? 'green' : 'amber'}`}>
                      {dep.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Strategic Priorities */}
      <div className="grid-3">
        <div className="card flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="sidebar-logo-mark" style={{ background: 'var(--c-brand-primary)' }}>
              <Code size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px' }}>Why n8n Orchestration?</h3>
              <p style={{ fontSize: '11px', color: 'var(--c-text-muted)' }}>Code-based visual builder</p>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--c-text-secondary)' }}>
            Unlike standard low-code, n8n integrates Javascript/Python code natively in nodes, matches GitHub for CI/CD, and executes complex JSON data transformation with raw speed, bypassing costly cloud connector limits.
          </p>
          <Link to="/n8n-orchestration" className="btn btn-secondary btn-sm mt-auto">
            Explore Workflows <ArrowRight size={12} />
          </Link>
        </div>

        <div className="card flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="sidebar-logo-mark" style={{ background: 'var(--c-rag-amber)' }}>
              <BrainCircuit size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px' }}>Adaptation Focus</h3>
              <p style={{ fontSize: '11px', color: 'var(--c-text-muted)' }}>Driving people-first AI adoption</p>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--c-text-secondary)' }}>
            Technology is only as good as its adaptation. Our AI Strategy focuses on simple-to-adopt AI assistance, custom conversational Copilots, and robust RAG governance to ensure staff trust and build confidence.
          </p>
          <Link to="/ai-adoption" className="btn btn-secondary btn-sm mt-auto">
            View Adoption Hub <ArrowRight size={12} />
          </Link>
        </div>

        <div className="card flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="sidebar-logo-mark" style={{ background: 'var(--c-rag-green)' }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px' }}>Enterprise Governance</h3>
              <p style={{ fontSize: '11px', color: 'var(--c-text-muted)' }}>Azure integration & RBAC</p>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--c-text-secondary)' }}>
            Enterprise automation requires tight boundaries. We maintain strict Data Loss Prevention (DLP) rules, Azure Key Vault integration for secrets management, and robust environment isolation to keep compliance spotless.
          </p>
          <Link to="/platform-governance" className="btn btn-secondary btn-sm mt-auto">
            Audit Governance <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  )
}
