import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:8000/api/hello/')
      .then(response => response.json())
      .then(data => {
        setMessage(data.message)
      })
      .catch(err => {
        setError(err.message)
        console.error('Error:', err)
      })
  }, [])

  return (
    <div className="App">
      <h1>Django + React Test</h1>
      {error ? (
        <p style={{color: 'red'}}>Error: {error}</p>
      ) : (
        <p>{message}</p>
      )}
    </div>
  )
}

export default App