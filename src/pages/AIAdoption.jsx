import React, { useState } from 'react'
import {
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Send
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts'

// Mock AI Adoption metrics
const trainingData = [
  { team: 'Water Operations', trained: 88, activeUse: 72 },
  { team: 'Customer Service', trained: 95, activeUse: 84 },
  { team: 'Network Planning', trained: 78, activeUse: 60 },
  { team: 'CoE & Tech Support', trained: 100, activeUse: 92 },
  { team: 'Asset Management', trained: 82, activeUse: 65 },
]

const monthlyQueries = [
  { month: 'Jan', queries: 400, accuracy: 89 },
  { month: 'Feb', queries: 620, accuracy: 91 },
  { month: 'Mar', queries: 890, accuracy: 93 },
  { month: 'Apr', queries: 1450, accuracy: 94 },
  { month: 'May', queries: 2100, accuracy: 95 },
  { month: 'Jun', queries: 3200, accuracy: 97 },
]

const preConfiguredQA = [
  {
    keywords: ['leak', 'leakage', 'anomaly'],
    answer: "For smart meter leakage detection, Southern Water triggers an alert when night flow exceeds 5 Litres/hour for 3 consecutive hours. These events are processed by n8n and written to the Leakage Anomalies table in Dataverse, which notifies technicians.",
    sources: ["SW Smart Metering Protocol v2.1", "Standard Operating Procedure SOP-L-22"]
  },
  {
    keywords: ['n8n', 'deployment', 'setup'],
    answer: "n8n is deployed within Southern Water's secure Azure Virtual Network using a Dockerized container instance. It secures all data inside our boundary and connects directly to Azure DevOps for CI/CD.",
    sources: ["CoE Cloud Deployment Blueprint 2026", "Information Security Architecture Guidelines"]
  },
  {
    keywords: ['copilot', 'studio', 'license'],
    answer: "Copilot Studio capabilities are provisioned via Microsoft 365 Admin Center. Users must be member of the active 'SW_Copilot_Users' Azure AD security group and complete the 'AI Ethics & Prompting' micro-course.",
    sources: ["M365 Licensing Strategy document", "CoE Training Syllabus"]
  }
]

export default function AIAdoption() {
  const [messages, setMessages] = useState([
    {
      sender: 'copilot',
      text: "Hello! I am the Southern Water CoE Copilot Assistant. Ask me anything about our smart metering automation policies, n8n deployment standards, or leakage protocols.",
      sources: []
    }
  ])
  const [inputQuery, setInputQuery] = useState('')
  const [feedbackGiven, setFeedbackGiven] = useState({})

  const handleSendMessage = () => {
    if (!inputQuery.trim()) return

    const userMessage = { sender: 'user', text: inputQuery, sources: [] }
    setMessages(prev => [...prev, userMessage])
    const query = inputQuery.toLowerCase()
    setInputQuery('')

    setTimeout(() => {
      // Find matching QA
      let matchedQA = preConfiguredQA.find(qa => 
        qa.keywords.some(kw => query.includes(kw))
      )

      if (!matchedQA) {
        matchedQA = {
          answer: "I couldn't find a direct policy matching that question. I've routed this query to the Automation CoE to update my RAG knowledge base. In general, all Southern Water automation and AI projects must align with DLP Policy v3.2.",
          sources: ["General CoE Guidelines"]
        }
      }

      setMessages(prev => [...prev, {
        sender: 'copilot',
        text: matchedQA.answer,
        sources: matchedQA.sources
      }])
    }, 800)
  }

  const handleFeedback = (index, type) => {
    setFeedbackGiven(prev => ({ ...prev, [index]: type }))
  }

  return (
    <div className="animate-in flex flex-col gap-5">
      {/* Adaptation Strategy Alert */}
      <div className="alert-banner amber">
        <div>
          <strong style={{ fontSize: '15px', display: 'block', marginBottom: '4px' }}>
            Adoption-First Implementation Strategy
          </strong>
          The primary failure point of corporate AI deployments is not the technology, but human adaptation. Our Automation CoE addresses this directly by implementing <strong>in-context training, conversational AI assistants</strong>, and <strong>transparent citation mechanisms (RAG)</strong> to build staff confidence and trust.
        </div>
      </div>

      <div className="grid-2-1">
        {/* Copilot Chat Simulator */}
        <div className="card flex flex-col" style={{ minHeight: '400px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Copilot RAG Chat Simulator</div>
              <div className="card-subtitle">Test internal search queries against verified PDF sources</div>
            </div>
            <span className="chip" style={{ color: 'var(--c-rag-green)', borderColor: 'var(--c-rag-green-bg)' }}>
              Model: Azure OpenAI (GPT-4o)
            </span>
          </div>

          {/* Chat box */}
          <div className="flex-1 flex flex-col gap-3 my-3 p-3" style={{ 
            backgroundColor: 'var(--c-bg-base)', 
            borderRadius: 'var(--radius-md)', 
            overflowY: 'auto',
            maxHeight: '260px',
            border: '1px solid var(--c-border)'
          }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col gap-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  maxWidth: '85%',
                  backgroundColor: msg.sender === 'user' ? 'var(--c-brand-primary)' : 'var(--c-bg-elevated)',
                  color: msg.sender === 'user' ? 'white' : 'var(--c-text-primary)',
                  border: msg.sender === 'user' ? 'none' : '1px solid var(--c-border)'
                }}>
                  {msg.text}
                </div>

                {msg.sources.length > 0 && (
                  <div style={{ fontSize: '10px', color: 'var(--c-text-muted)', display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px', paddingLeft: '4px' }}>
                    <strong>Sources:</strong>
                    {msg.sources.map((src, sIdx) => (
                      <span key={sIdx} className="chip" style={{ fontSize: '9px', padding: '0px 6px' }}>
                        📚 {src}
                      </span>
                    ))}
                  </div>
                )}

                {msg.sender === 'copilot' && idx > 0 && (
                  <div className="flex items-center gap-2 mt-1" style={{ paddingLeft: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--c-text-muted)' }}>Was this helpful?</span>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ padding: '2px 4px', color: feedbackGiven[idx] === 'up' ? 'var(--c-rag-green)' : 'inherit' }}
                      onClick={() => handleFeedback(idx, 'up')}
                    >
                      <ThumbsUp size={12} />
                    </button>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ padding: '2px 4px', color: feedbackGiven[idx] === 'down' ? 'var(--c-rag-red)' : 'inherit' }}
                      onClick={() => handleFeedback(idx, 'down')}
                    >
                      <ThumbsDown size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Chat input */}
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Ask: 'how is n8n deployed?' or 'what is the leak trigger policy?'..." 
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={handleSendMessage}>
              <Send size={14} /> Send
            </button>
          </div>
        </div>

        {/* Query Analytics & Quality */}
        <div className="card flex flex-col gap-4">
          <div className="card-header">
            <div>
              <div className="card-title">RAG Quality Metrics</div>
              <div className="card-subtitle">User-graded accuracy tracking</div>
            </div>
          </div>
          <div className="flex-1 chart-container" style={{ height: '180px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyQueries} margin={{ top: 10, right: 10, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
                <XAxis dataKey="month" />
                <YAxis domain={[80, 100]} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }} />
                <Line type="monotone" dataKey="accuracy" name="Accuracy Rating (%)" stroke="var(--c-brand-accent)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2" style={{ fontSize: '12px' }}>
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--c-text-muted)' }}>Average Citation Match</span>
              <span className="mono font-semibold" style={{ color: 'var(--c-rag-green)' }}>98.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span style={{ color: 'var(--c-text-muted)' }}>Mismatched Citations (Hallucinations)</span>
              <span className="mono font-semibold" style={{ color: 'var(--c-rag-red)' }}>0.4%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Team Training & Utilization */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Citizen Developer Training & Adaptation by Department</div>
            <div className="card-subtitle">Measuring employee enablement and proactive AI tool usage</div>
          </div>
        </div>
        <div className="grid-1-2 items-center">
          <div className="flex flex-col gap-3">
            <h4 style={{ fontSize: '14px' }}>Adaptation Highlights</h4>
            <div className="flex items-start gap-2 text-xs">
              <CheckCircle size={16} style={{ color: 'var(--c-rag-green)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>Customer Service leading:</strong> 84% active daily use of AI search widgets to fetch customer metering history.
              </div>
            </div>
            <div className="flex items-start gap-2 text-xs">
              <CheckCircle size={16} style={{ color: 'var(--c-rag-green)', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong>CoE Champions Program:</strong> 15 citizen developers graduated from custom n8n API integration pathways.
              </div>
            </div>
          </div>
          <div className="chart-container" style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainingData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--c-border)" />
                <XAxis dataKey="team" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: 'var(--c-bg-card)', borderColor: 'var(--c-border)' }} />
                <Bar dataKey="trained" name="% Trained Employees" fill="var(--c-brand-primary)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="activeUse" name="% Active AI Users" fill="var(--c-brand-accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
