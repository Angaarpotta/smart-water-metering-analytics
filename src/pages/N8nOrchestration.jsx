import React, { useState } from 'react'
import {
  Play,
  CheckCircle,
  GitPullRequest,
  Code,
  Terminal,
  Zap,
  Check,
  RefreshCw,
  Clock,
  Send,
  Database,
  ArrowRight
} from 'lucide-react'

const comparisonFeatures = [
  { feature: 'CI/CD & Version Control', n8n: 'Native Git sync (JSON workflows committed to repo)', power: 'Solution packages (complex to automate via Azure DevOps)', rpa: 'Binary files or vendor cloud locking' },
  { feature: 'Custom Logic & Code', n8n: 'Native Javascript/Python nodes inside visual editor', power: 'Complex Custom Connectors or Azure Functions required', rpa: 'Custom C# scripts within proprietary wrappers' },
  { feature: 'Deployment & Costs', n8n: 'Self-hosted (Docker/Azure K8s) - Unlimited runs', power: 'Per-user / Per-flow licenses + API premium connector fees', rpa: 'Expensive desktop bot VM licenses' },
  { feature: 'JSON / Payload Handling', n8n: 'Native nested JSON manipulation via expression editor', power: 'Strict schemas; parsing arrays is cumbersome', rpa: 'Excel-like structures, hard to parse deep API response' },
]

const initialWorkflowNodes = [
  { id: 'trigger', label: 'Webhook: Meter Read', type: 'trigger', desc: 'Receives smart meter telemetry from Azure IoT', status: 'idle' },
  { id: 'api_fetch', label: 'Get Zone Metadata', type: 'action', desc: 'Azure Web API request using secure Key Vault credentials', status: 'idle' },
  { id: 'code_node', label: 'JS Code: Leak Detection', type: 'code', desc: 'Custom Javascript checking consecutive nighttime flow > 5L/h', status: 'idle' },
  { id: 'dataverse', label: 'Update Dataverse', type: 'action', desc: 'Upserts anomaly report into Southern Water Dataverse table', status: 'idle' },
  { id: 'logic_apps', label: 'Trigger Logic App', type: 'event', desc: 'Sends critical SMS/Email alerts via Logic Apps API', status: 'idle' },
]

export default function N8nOrchestration() {
  const [nodes, setNodes] = useState(initialWorkflowNodes)
  const [isRunning, setIsRunning] = useState(false)
  const [outputConsole, setOutputConsole] = useState(['Console ready. Click "Execute Workflow Simulation" to run.'])
  const [selectedNode, setSelectedNode] = useState(null)

  const logMessage = (msg) => {
    setOutputConsole(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  const runSimulation = async () => {
    if (isRunning) return
    setIsRunning(true)
    setOutputConsole([])
    
    const sleep = (ms) => new Promise(res => setTimeout(res, ms))

    // Step 1: Webhook Trigger
    setNodes(prev => prev.map(n => n.id === 'trigger' ? { ...n, status: 'running' } : n))
    logMessage('⚡ Webhook triggered with payload: { meterId: "SW-MTR-9021", rate: 12.8, timestamp: "2026-06-27T14:00:00Z" }')
    await sleep(1000)
    setNodes(prev => prev.map(n => n.id === 'trigger' ? { ...n, status: 'success' } : n))

    // Step 2: API Fetch
    setNodes(prev => prev.map(n => n.id === 'api_fetch' ? { ...n, status: 'running' } : n))
    logMessage('📡 Fetching Southern Water zone metadata from API: /api/v1/zones/SW-MTR-9021')
    logMessage('🔑 Authentication validated with Azure Key Vault secrets')
    await sleep(1200)
    setNodes(prev => prev.map(n => n.id === 'api_fetch' ? { ...n, status: 'success' } : n))

    // Step 3: JS Code execution
    setNodes(prev => prev.map(n => n.id === 'code_node' ? { ...n, status: 'running' } : n))
    logMessage('💻 Running JavaScript node. Checking anomaly telemetry...')
    logMessage('🔍 Telemetry analysis: Nighttime average is 7.2L/h. Threshold: 5.0L/h.')
    logMessage('⚠️ Status evaluated: LEAK DETECTED (Amber Alert)')
    await sleep(1500)
    setNodes(prev => prev.map(n => n.id === 'code_node' ? { ...n, status: 'success' } : n))

    // Step 4: Dataverse
    setNodes(prev => prev.map(n => n.id === 'dataverse' ? { ...n, status: 'running' } : n))
    logMessage('🗄️ Connected to Dataverse API endpoint')
    logMessage('📥 Creating record in "Leakage Anomalies" entity')
    await sleep(1000)
    setNodes(prev => prev.map(n => n.id === 'dataverse' ? { ...n, status: 'success' } : n))

    // Step 5: Logic Apps Trigger
    setNodes(prev => prev.map(n => n.id === 'logic_apps' ? { ...n, status: 'running' } : n))
    logMessage('📤 Event-driven trigger sent to Azure Integration Services')
    logMessage('🚀 Triggered Logic App Flow: "LeakAlert_SendSms"')
    await sleep(800)
    setNodes(prev => prev.map(n => n.id === 'logic_apps' ? { ...n, status: 'success' } : n))

    logMessage('✅ Workflow executed successfully in 5.5s.')
    setIsRunning(false)
  }

  const resetWorkflow = () => {
    setNodes(initialWorkflowNodes)
    setOutputConsole(['Console reset. Ready.'])
  }

  return (
    <div className="animate-in flex flex-col gap-5">
      {/* Intro info */}
      <div className="grid-2-1">
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Why n8n Outperforms Standard Low-Code & RPA</div>
              <div className="card-subtitle">Comparing code-based workflows with Microsoft Power Platform and traditional UI bots</div>
            </div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Capability</th>
                  <th style={{ color: 'var(--c-brand-primary)' }}>n8n (Recommended)</th>
                  <th>Power Automate</th>
                  <th>Traditional RPA</th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx}>
                    <td><strong>{row.feature}</strong></td>
                    <td style={{ color: 'var(--c-text-primary)', backgroundColor: 'rgba(0,180,216,0.05)' }}>
                      <span className="flex items-center gap-1">
                        <Check size={14} style={{ color: 'var(--c-rag-green)' }} />
                        {row.n8n}
                      </span>
                    </td>
                    <td>{row.power}</td>
                    <td>{row.rpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card flex flex-col gap-4">
          <div className="card-header">
            <div>
              <div className="card-title">Code-Based Versatility</div>
              <div className="card-subtitle">Direct JavaScript node preview</div>
            </div>
          </div>
          <div style={{ backgroundColor: 'var(--c-bg-base)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--c-border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="mono text-xs" style={{ color: 'var(--c-text-muted)' }}>leakCheckNode.js</span>
              <span className="chip" style={{ fontSize: '9px' }}>n8n JavaScript VM</span>
            </div>
            <pre className="mono" style={{ fontSize: '11px', color: 'var(--c-brand-accent)', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
{`// Evaluate anomaly readings
const items = $input.all();
for (let item of items) {
  const nightAvg = item.json.nightFlows.reduce((a, b) => a + b, 0) / 4;
  item.json.hasLeak = nightAvg > 5.0; // Litres/hour
  item.json.leakSeverity = nightAvg > 15.0 ? 'Critical' : 'Medium';
}
return items;`}
            </pre>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--c-text-secondary)' }}>
            <strong>Git Sync Ready:</strong> This Javascript code is stored as standard text in a JSON configuration, allowing full Git branching, peer review, and CI/CD promotion across Dev/Staging/Production environments.
          </p>
        </div>
      </div>

      {/* Interactive Workflow simulation */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Smart Meter Leakage Detection Workflow Simulation</div>
            <div className="card-subtitle">An event-driven orchestration demonstrating n8n connecting to Azure APIs and Dataverse</div>
          </div>
          <div className="btn-group">
            <button className="btn btn-secondary btn-sm" onClick={resetWorkflow} disabled={isRunning}>
              <RefreshCw size={14} /> Reset
            </button>
            <button className="btn btn-primary btn-sm" onClick={runSimulation} disabled={isRunning}>
              <Play size={14} /> Execute Workflow Simulation
            </button>
          </div>
        </div>

        {/* Node board */}
        <div className="flex flex-wrap items-center justify-center gap-4 my-5" style={{ minHeight: '100px' }}>
          {nodes.map((node, index) => (
            <React.Fragment key={node.id}>
              <div 
                className={`card cursor-pointer animate-in flex flex-col gap-2`}
                style={{ 
                  width: '200px', 
                  padding: '12px', 
                  borderWidth: '2px', 
                  borderColor: 
                    node.status === 'running' ? 'var(--c-rag-amber)' :
                    node.status === 'success' ? 'var(--c-rag-green)' :
                    'var(--c-border)',
                  backgroundColor: 'var(--c-bg-elevated)',
                  boxShadow: node.status === 'running' ? '0 0 15px var(--c-rag-amber)' : 'none'
                }}
                onClick={() => setSelectedNode(node)}
              >
                <div className="flex items-center justify-between">
                  <span className="chip" style={{ fontSize: '9px', textTransform: 'uppercase' }}>{node.type}</span>
                  {node.status === 'success' && <CheckCircle size={14} style={{ color: 'var(--c-rag-green)' }} />}
                  {node.status === 'running' && <div className="spinner" style={{ width: '12px', height: '12px', borderWidth: '2px' }} />}
                </div>
                <strong style={{ fontSize: '13px' }}>{node.label}</strong>
                <span style={{ fontSize: '10px', color: 'var(--c-text-muted)' }}>{node.desc}</span>
              </div>
              {index < nodes.length - 1 && (
                <ArrowRight size={18} style={{ color: 'var(--c-text-muted)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Selected Node Drawer / Console split */}
        <div className="grid-2-1">
          {/* Output console log */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="mono text-xs">Workflow Console Logs</span>
              <span className="mono text-xs" style={{ color: 'var(--c-text-muted)' }}>{isRunning ? 'RUNNING' : 'IDLE'}</span>
            </div>
            <div style={{ 
              backgroundColor: 'var(--c-bg-base)', 
              borderRadius: 'var(--radius-md)', 
              padding: '12px', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '11px', 
              color: 'var(--c-text-primary)',
              height: '180px',
              overflowY: 'auto',
              border: '1px solid var(--c-border)'
            }}>
              {outputConsole.map((log, idx) => (
                <div key={idx} style={{ marginBottom: '4px', borderLeft: '2px solid var(--c-brand-primary)', paddingLeft: '8px' }}>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Node Details Panel */}
          <div style={{ backgroundColor: 'var(--c-bg-elevated)', border: '1px solid var(--c-border)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
            <h4 style={{ fontSize: '13px', marginBottom: '8px' }}>Node Properties Node Config</h4>
            {selectedNode ? (
              <div className="flex flex-col gap-2">
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--c-text-muted)' }}>Node Name</span>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>{selectedNode.label}</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--c-text-muted)' }}>Type</span>
                  <div>{selectedNode.type}</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--c-text-muted)' }}>Description</span>
                  <div style={{ fontSize: '12px', color: 'var(--c-text-secondary)' }}>{selectedNode.desc}</div>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--c-text-muted)' }}>Status</span>
                  <div>
                    <span className={`rag-badge ${selectedNode.status === 'success' ? 'green' : selectedNode.status === 'running' ? 'amber' : 'blue'}`}>
                      {selectedNode.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--c-text-muted)', textAlign: 'center', marginTop: '30px' }}>
                Click a workflow node above to inspect its execution parameters, input schema, and credentials mapping.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
