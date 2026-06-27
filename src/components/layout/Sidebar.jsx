import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Gauge,
  Droplets,
  FileText,
  ShieldCheck,
  Workflow,
  BrainCircuit,
  ShieldEllipsis,
  Cpu,
} from 'lucide-react'

const NAV_ITEMS = [
  {
    section: 'Analytics',
    items: [
      { to: '/',                   icon: LayoutDashboard, label: 'Dashboard',            id: 'nav-dashboard' },
      { to: '/meter-performance',  icon: Gauge,           label: 'Meter Performance',    id: 'nav-meter' },
      { to: '/leakage-analysis',   icon: Droplets,        label: 'Leakage Analysis',     id: 'nav-leakage' },
    ],
  },
  {
    section: 'Reporting',
    items: [
      { to: '/regulatory-reporting', icon: FileText,    label: 'Regulatory Reporting', id: 'nav-regulatory' },
      { to: '/data-quality',         icon: ShieldCheck, label: 'Data Quality',         id: 'nav-quality' },
    ],
  },
  {
    section: 'Automation Hub',
    accent: true,
    items: [
      { to: '/automation-hub',        icon: Cpu,             label: 'CoE Overview',         id: 'nav-automation-hub' },
      { to: '/n8n-orchestration',     icon: Workflow,        label: 'n8n Orchestration',    id: 'nav-n8n' },
      { to: '/ai-adoption',           icon: BrainCircuit,    label: 'AI Adoption',          id: 'nav-ai-adoption' },
      { to: '/platform-governance',   icon: ShieldEllipsis,  label: 'Platform Governance',  id: 'nav-governance' },
    ],
  },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">SW</div>
        <div className="sidebar-logo-text">
          <div className="sidebar-logo-title">Smart Metering</div>
          <div className="sidebar-logo-sub">Analytics Platform</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(group => (
          <div key={group.section}>
            <div className="sidebar-section-label">{group.section}</div>
            {group.items.map(({ to, icon: Icon, label, id }) => {
              const isActive = to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to)
              return (
                <NavLink
                  key={to}
                  to={to}
                  id={id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <Icon className="nav-item-icon" size={18} />
                  {label}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-status">
          <div className="status-dot" />
          Live — June 2026
        </div>
        <div style={{ fontSize: '10px', color: 'var(--c-text-muted)', marginTop: '4px' }}>
          Southern Water · Smart Metering Programme
        </div>
      </div>
    </aside>
  )
}
