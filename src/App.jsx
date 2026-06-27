import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import MeterPerformance from './pages/MeterPerformance'
import LeakageAnalysis from './pages/LeakageAnalysis'
import RegulatoryReporting from './pages/RegulatoryReporting'
import DataQuality from './pages/DataQuality'
import AutomationHub from './pages/AutomationHub'
import N8nOrchestration from './pages/N8nOrchestration'
import AIAdoption from './pages/AIAdoption'
import PlatformGovernance from './pages/PlatformGovernance'

export default function App() {
  const location = useLocation()

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header pathname={location.pathname} />
        <main className="page-body">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meter-performance" element={<MeterPerformance />} />
            <Route path="/leakage-analysis" element={<LeakageAnalysis />} />
            <Route path="/regulatory-reporting" element={<RegulatoryReporting />} />
            <Route path="/data-quality" element={<DataQuality />} />
            <Route path="/automation-hub" element={<AutomationHub />} />
            <Route path="/n8n-orchestration" element={<N8nOrchestration />} />
            <Route path="/ai-adoption" element={<AIAdoption />} />
            <Route path="/platform-governance" element={<PlatformGovernance />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
