import { Link } from 'react-router-dom'

function Navbar() {
  const COLORS = {
    dark: '#273E47',
    primary: '#D8973C',
    white: '#FFFFFF'
  }

  return (
    <nav style={{ 
      padding: '20px 40px', 
      background: COLORS.dark, 
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex',
      gap: '24px',
      alignItems: 'center'
    }}>
      <Link 
        to="/" 
        style={{ 
          color: COLORS.white,
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: '600',
          padding: '8px 16px',
          borderRadius: '6px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = COLORS.primary;
          e.target.style.color = COLORS.white;
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'transparent';
          e.target.style.color = COLORS.white;
        }}
      >
        Home
      </Link>
      <Link 
        to="/resume" 
        style={{ 
          color: COLORS.white,
          textDecoration: 'none',
          fontSize: '16px',
          fontWeight: '600',
          padding: '8px 16px',
          borderRadius: '6px',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.background = COLORS.primary;
          e.target.style.color = COLORS.white;
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'transparent';
          e.target.style.color = COLORS.white;
        }}
      >
        Manage Resume
      </Link>
    </nav>
  )
}

export default Navbar