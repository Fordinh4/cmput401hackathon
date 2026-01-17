import { NavLink } from 'react-router-dom';
import { Home, FileText, Briefcase } from 'lucide-react';

const COLORS = {
  primary: '#D8973C',
  secondary: '#BD632F',
  dark: '#273E47',
  white: '#FFFFFF',
};

function Navbar() {
  // Dynamic styling for active/inactive links
  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: isActive ? COLORS.white : 'rgba(255, 255, 255, 0.7)',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '600',
    padding: '10px 20px',
    borderRadius: '12px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    background: isActive ? `${COLORS.primary}` : 'transparent',
    boxShadow: isActive ? `0 4px 12px ${COLORS.primary}40` : 'none',
  });

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '15px 60px',
      // Glassmorphism effect:
      background: `${COLORS.dark}E6`, // E6 adds 90% opacity
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${COLORS.primary}20`
    }}>
      
      {/* Branding Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ 
          background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 12px ${COLORS.primary}30`
        }}>
          <Briefcase size={22} color={COLORS.white} />
        </div>
        <span style={{ 
          color: COLORS.white, 
          fontSize: '22px', 
          fontWeight: '800', 
          letterSpacing: '-0.5px' 
        }}>
          Job<span style={{ color: COLORS.primary }}>Tracker</span>
        </span>
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '10px' }}>
        <NavLink to="/" style={navLinkStyle}>
          <Home size={18} />
          Home
        </NavLink>
        <NavLink to="/resume" style={navLinkStyle}>
          <FileText size={18} />
          Manage Resume
        </NavLink>
      </div>

      <style>{`
        /* Subtle hover effect for inactive links */
        a:hover:not(.active) {
          background: rgba(255, 255, 255, 0.05) !important;
          color: ${COLORS.white} !important;
        }
      `}</style>
    </nav>
  );
}

export default Navbar;