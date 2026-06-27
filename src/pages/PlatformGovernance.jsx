import React, { useState } from 'react'
import {
  ShieldCheck,
  Server,
  Lock,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  Cpu,
  UserCheck
} from 'lucide-react'

const environmentHealth = [
  { id: 'ENV-01', name: 'M365 Power Platform Prod', type: 'SaaS', region: 'UK South', status: 'Healthy', activeFlows: 54, securityVetting: '100% Passed' },
  { id: 'ENV-02', name: 'Azure Integration Services', type: 'PaaS', region: 'UK South', status: 'Healthy', activeFlows: 25, securityVetting: '100% Passed' },
  { id: 'ENV-03', name: 'n8n Self-Hosted VNET Cluster', type: 'Docker / Azure Container Apps', region: 'UK West', status: 'Healthy', activeFlows: 95, securityVetting: '100% Passed' },
  { id: 'ENV-04', name: 'Citizen Sandbox Env', type: 'SaaS / Hybrid', region: 'UK South', status: 'Healthy', activeFlows: 142, securityVetting: 'Isolated' },
]

const dlpPolicies = [
  { policyName: 'Southern Water Customer Data Block', target: 'M365 Power Platform', status: 'Active', description: 'Blocks leakage telemetry and billing details from leaving tenant boundaries' },
  { policyName: 'Key Vault Secrets Lockdown', target: 'Azure & n8n API Connections', status: 'Active', description: 'Restricts credential storage strictly to Azure Key Vault & n8n secure variables storage' },
  { policyName: 'Public Webhook Source Verification', target: 'Event Triggers / IoT Webhooks', status: 'Active', description: 'Requires SHA-256 HMAC verification signatures for all incoming meter read APIs' },
]

const devopsPipelines = [
  { repo: 'coe-n8n-workflows', branch: 'main', lastCommit: 'Merge pull request #45 from integration/leakage-detector', testResult: 'Passed', deployStatus: 'Deployed' },
  { repo: 'azure-logic-apps-arm', branch: 'release-1.8', lastCommit: 'Update Logic App ARM schemas for UK South failover', testResult: 'Passed', deployStatus: 'Deployed' },
  { repo: 'power-platform-solutions', branch: 'main', lastCommit: 'Export Smart Meter approval flows solutions package', testResult: 'Passed', deployStatus: 'Pending Sync' },
]

export default function PlatformGovernance() {
  const [activeTab, setActiveTab] = useState('security')

  return (
    <div className="animate-in flex flex-col gap-5">
      {/* Strategic Header */}
      <div className="alert-banner green">
        <div>
          <strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>
            Enterprise Governance Framework
          </strong>
          Automation without governance leads to shadow IT. Southern Water CoE enforces environment segregation, strict Data Loss Prevention (DLP) parameters, Azure AD identity federation, and a DevOps-driven promotion pipeline to run high-scale digital operations safely.
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-bottom pb-2" style={{ borderBottom: '1px solid var(--c-border)' }}>
        <button 
          className={`btn ${activeTab === 'environments' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('environments')}
        >
          <Server size={14} /> Environments & Infrastructure
        </button>
        <button 
          className={`btn ${activeTab === 'security' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('security')}
        >
          <Lock size={14} /> DLP & Identity Controls
        </button>
        <button 
          className={`btn ${activeTab === 'devops' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('devops')}
        >
          <GitBranch size={14} /> DevOps & CI/CD Pipelines
        </button>
      </div>

      {/* Tab Content: Environments */}
      {activeTab === 'environments' && (
        <div className="animate-in flex flex-col gap-4">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Orchestrated Environments</div>
                <div className="card-subtitle">Operational status of core integration and low-code instances</div>
              </div>
              <span className="chip" style={{ color: 'var(--c-rag-green)' }}>All Systems Operational</span>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Env ID</th>
                    <th>Environment Name</th>
                    <th>Type</th>
                    <th>Region</th>
                    <th>Vetting Check</th>
                    <th>Active Flows</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {environmentHealth.map((env) => (
                    <tr key={env.id}>
                      <td className="mono">{env.id}</td>
                      <td><strong>{env.name}</strong></td>
                      <td>{env.type}</td>
                      <td className="mono">{env.region}</td>
                      <td>
                        <span className="flex items-center gap-1 text-xs">
                          <ShieldCheck size={12} style={{ color: 'var(--c-rag-green)' }} />
                          {env.securityVetting}
                        </span>
                      </td>
                      <td className="mono">{env.activeFlows}</td>
                      <td>
                        <span className="rag-badge green">{env.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Azure Key Vault Integration</div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--c-text-secondary)', marginBottom: '12px' }}>
                All API keys, Dataverse client secrets, and database connection strings are dynamically retrieved from <strong>Azure Key Vault</strong>. Workflows do not store raw strings in files.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs border-bottom py-1" style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <span>Managed Secrets Count</span>
                  <span className="mono font-semibold">42 secrets</span>
                </div>
                <div className="flex justify-between items-center text-xs border-bottom py-1" style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <span>Last Automated Secrets Rotation</span>
                  <span className="mono font-semibold">24 hours ago</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span>SSL Vetting Status</span>
                  <span className="mono font-semibold" style={{ color: 'var(--c-rag-green)' }}>100% SSL A+ Rating</span>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div className="card-title">Platform API Performance Monitoring</div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--c-text-secondary)', marginBottom: '12px' }}>
                Event-driven calls monitored via <strong>Azure Monitor</strong> to trace latency across system boundaries (IoT feeds to CRM updates).
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs border-bottom py-1" style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <span>API Latency Average</span>
                  <span className="mono font-semibold">124 ms</span>
                </div>
                <div className="flex justify-between items-center text-xs border-bottom py-1" style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <span>Peak Request Throughput</span>
                  <span className="mono font-semibold">1,250 req/sec</span>
                </div>
                <div className="flex justify-between items-center text-xs py-1">
                  <span>Webhook Fail Rate</span>
                  <span className="mono font-semibold" style={{ color: 'var(--c-rag-green)' }}>0.02% (Target &lt; 0.1%)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Security */}
      {activeTab === 'security' && (
        <div className="animate-in flex flex-col gap-4">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">Data Loss Prevention (DLP) Policies</div>
                <div className="card-subtitle">Active governance constraints protecting Southern Water internal databases</div>
              </div>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Policy Name</th>
                    <th>Target Systems</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {dlpPolicies.map((dlp, idx) => (
                    <tr key={idx}>
                      <td><strong>{dlp.policyName}</strong></td>
                      <td><span className="chip">{dlp.target}</span></td>
                      <td style={{ fontSize: '12px', color: 'var(--c-text-secondary)' }}>{dlp.description}</td>
                      <td>
                        <span className="rag-badge green">{dlp.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-header">
                <div className="card-title">Identity & Access (RBAC) Controls</div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--c-text-secondary)', marginBottom: '12px' }}>
                All user accounts are provisioned via Microsoft Entra ID (Azure AD). Role-Based Access Control limits editing access to certified Platform Engineers.
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-xs border-bottom py-2" style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <UserCheck size={16} style={{ color: 'var(--c-rag-green)' }} />
                  <div>
                    <strong>Platform Admin Group:</strong> Full write permissions (restricted to CoE core engineers).
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs border-bottom py-2" style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <UserCheck size={16} style={{ color: 'var(--c-rag-green)' }} />
                  <div>
                    <strong>Citizen Creator Group:</strong> Sandbox write permissions + strict local DLP rules.
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs py-2">
                  <UserCheck size={16} style={{ color: 'var(--c-rag-green)' }} />
                  <div>
                    <strong>Reader Group:</strong> Read-only monitoring of KPIs and analytics endpoints.
                  </div>
                </div>
              </div>
            </div>

            <div className="card flex flex-col gap-3">
              <div className="card-header">
                <div className="card-title">Security Vetting & Pre-Employment Checks</div>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--c-text-secondary)' }}>
                In compliance with Southern Water security standards, all platform users accessing production endpoints are required to undergo criminal record checks (DBS), identity verification, and 3-year employment history vetting.
              </p>
              <div style={{ backgroundColor: 'var(--c-bg-base)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius-md)', padding: '10px' }} className="flex justify-between items-center text-xs">
                <span>Vetted Users Count</span>
                <strong style={{ color: 'var(--c-rag-green)' }}>14 Employees Passed</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: DevOps */}
      {activeTab === 'devops' && (
        <div className="animate-in flex flex-col gap-4">
          <div className="card">
            <div className="card-header">
              <div>
                <div className="card-title">DevOps & CI/CD Solution Repositories</div>
                <div className="card-subtitle">Version control integration status and unit testing pipelines</div>
              </div>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Repository Name</th>
                    <th>Branch</th>
                    <th>Latest Commit Summary</th>
                    <th>Testing Status</th>
                    <th>Sync Status</th>
                  </tr>
                </thead>
                <tbody>
                  {devopsPipelines.map((repo, idx) => (
                    <tr key={idx}>
                      <td className="mono"><strong>{repo.repo}</strong></td>
                      <td className="mono">{repo.branch}</td>
                      <td style={{ fontSize: '12px' }}>{repo.lastCommit}</td>
                      <td>
                        <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--c-rag-green)' }}>
                          <CheckCircle size={12} /> {repo.testResult}
                        </span>
                      </td>
                      <td>
                        <span className={`rag-badge ${repo.deployStatus === 'Deployed' ? 'green' : 'amber'}`}>
                          {repo.deployStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Automation Promotion Pipeline (Dev &rarr; Prod)</div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 p-4" style={{ backgroundColor: 'var(--c-bg-base)', borderRadius: 'var(--radius-md)', border: '1px solid var(--c-border)' }}>
              <div className="text-center" style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>1. Developer sandbox</div>
                <p style={{ fontSize: '11px', color: 'var(--c-text-muted)' }}>n8n Sandbox / Power Apps Dev</p>
              </div>
              <ArrowRight size={20} style={{ color: 'var(--c-text-muted)' }} />
              <div className="text-center" style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>2. Git PR Review</div>
                <p style={{ fontSize: '11px', color: 'var(--c-text-muted)' }}>GitHub Action runs tests & linter</p>
              </div>
              <ArrowRight size={20} style={{ color: 'var(--c-text-muted)' }} />
              <div className="text-center" style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>3. Staging / Dry Run</div>
                <p style={{ fontSize: '11px', color: 'var(--c-text-muted)' }}>Validates Azure Key Vault secrets</p>
              </div>
              <ArrowRight size={20} style={{ color: 'var(--c-text-muted)' }} />
              <div className="text-center" style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--c-rag-green)' }}>4. Prod Release</div>
                <p style={{ fontSize: '11px', color: 'var(--c-text-muted)' }}>n8n automated Git pulls</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
