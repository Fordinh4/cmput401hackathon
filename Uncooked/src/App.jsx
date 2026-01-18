import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import MasterResumeEditor from './components/MasterResumeEditor'
import YetToApplyJobsList from './components/YetToApplyJobsList'
import TailoredResumeView from './components/TailoredResumeView'

function App() {
  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', backgroundColor: '#F5F5F5', width: '100%', margin: 0, padding: 0 }}>
        {/* Navigation */}
        <nav style={{
          padding: '20px 40px', 
          background: 'linear-gradient(135deg, #1a2930 0%, #273E47 40%, #BD632F 100%)', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex',
          gap: '32px',
          alignItems: 'center'
        }}>
          {/* UNCOOKED Logo */}
          <div style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#FFFFFF',
            letterSpacing: '3px',
            marginRight: 'auto',
            textShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}>
            UNCOOKED
          </div>
          
          <Link to="/" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#D8973C';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'white';
          }}>
            🏠 Home
          </Link>
          <Link to="/master-resume" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#D8973C';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'white';
          }}>
            📝 Master Resume
          </Link>
          <Link to="/jobs" style={{
            color: 'white',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: '600',
            padding: '8px 16px',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#D8973C';
            e.currentTarget.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = 'white';
          }}>
            💼 Resume Tailor
          </Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/master-resume" element={<MasterResumeEditor />} />
          <Route path="/jobs" element={<YetToApplyJobsList />} />
          <Route path="/tailored/:id" element={<TailoredResumeView />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
