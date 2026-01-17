import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import './App.css'
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
          background: '#273E47', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          gap: '24px',
          alignItems: 'center'
        }}>
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
            Master Resume
          </Link>
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
            Job Applications
          </Link>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<YetToApplyJobsList />} />
          <Route path="/master-resume" element={<MasterResumeEditor />} />
          <Route path="/tailored/:id" element={<TailoredResumeView />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
