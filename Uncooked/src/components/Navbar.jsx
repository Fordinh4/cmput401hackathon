import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav style={{ padding: '20px', background: '#333', color: 'white' }}>
      <Link to="/" style={{ margin: '0 10px', color: 'white' }}>Home</Link>
      <Link to="/tracking" style={{ margin: '0 10px', color: 'white' }}>Track Applications</Link>
      <Link to="/resume" style={{ margin: '0 10px', color: 'white' }}>Manage Resume</Link>
    </nav>
  )
}

export default Navbar