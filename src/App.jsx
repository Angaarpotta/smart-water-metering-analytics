import { Routes, Route, useLocation } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import Dashboard from './pages/Dashboard'
import MeterPerformance from './pages/MeterPerformance'
import LeakageAnalysis from './pages/LeakageAnalysis'
import RegulatoryReporting from './pages/RegulatoryReporting'
import DataQuality from './pages/DataQuality'

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
          </Routes>
        </main>
      </div>
    </div>
  )
}
