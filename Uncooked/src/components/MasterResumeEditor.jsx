import { useState, useEffect } from 'react';
import ResumeEditor from './ResumeEditor';

const API_BASE = 'http://localhost:8000/api';

function MasterResumeEditor() {
  const [htmlContent, setHtmlContent] = useState('');
  const [name, setName] = useState('Master Resume');
  const [resumeId, setResumeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMasterResume();
  }, []);

  const fetchMasterResume = async () => {
    try {
      const response = await fetch(`${API_BASE}/resume/master/`);
      if (response.status === 204) {
        // No master resume yet
        setHtmlContent(getDefaultHtml());
        return;
      }
      const data = await response.json();
      setResumeId(data.id);
      setName(data.name);
      setHtmlContent(data.html_content || data.latex_content || getDefaultHtml());
    } catch (error) {
      console.error('Error fetching master resume:', error);
      setHtmlContent(getDefaultHtml());
    }
  };

  const saveMasterResume = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // If resumeId exists, update (PATCH). Otherwise create (POST)
      const url = resumeId 
        ? `${API_BASE}/resume/master/${resumeId}/`
        : `${API_BASE}/resume/master/`;
      const method = resumeId ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name,
          html_content: htmlContent,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResumeId(data.id); // Store ID for future updates
        setMessage('✅ Master resume saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('❌ Failed to save resume');
      }
    } catch (error) {
      console.error('Error saving master resume:', error);
      setMessage('❌ Error saving resume');
    } finally {
      setLoading(false);
    }
  };

  const getDefaultHtml = () => {
    return `
<h1 style="text-align: center;">Your Name</h1>
<p style="text-align: center;">Email: your.email@example.com | Phone: (123) 456-7890<br>
LinkedIn: linkedin.com/in/yourprofile | GitHub: github.com/yourusername</p>

<h2>Summary</h2>
<p>A brief professional summary highlighting your key skills and experience.</p>

<h2>Experience</h2>
<p><strong>Job Title</strong> | Company Name | Jan 2020 - Present</p>
<ul>
  <li>Achievement or responsibility 1</li>
  <li>Achievement or responsibility 2</li>
  <li>Achievement or responsibility 3</li>
</ul>

<h2>Education</h2>
<p><strong>Degree</strong> | University Name | Graduation Year<br>
Major: Your Major, GPA: X.XX</p>

<h2>Skills</h2>
<p><strong>Programming:</strong> Python, JavaScript, Java<br>
<strong>Technologies:</strong> React, Django, Docker<br>
<strong>Other:</strong> Git, Agile, Communication</p>
    `.trim();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '25px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderTop: '4px solid #BD632F'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#273E47' }}>Master Resume Editor</h1>
        <p style={{ margin: 0, color: '#7f8c8d', fontSize: '16px' }}>Edit your master resume. This will be used as the template for tailored resumes.</p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ fontSize: '16px', fontWeight: '600', color: '#273E47' }}>
          Resume Name: 
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ 
              marginLeft: '10px', 
              padding: '8px 12px', 
              width: '300px',
              border: '2px solid #D8973C',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <ResumeEditor
          content={htmlContent}
          onChange={(html) => setHtmlContent(html)}
          readOnly={false}
        />
      </div>

      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <button
          onClick={saveMasterResume}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#BD632F',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
          }}
        >
          {loading ? 'Saving...' : 'Save Master Resume'}
        </button>
        {message && <span style={{ color: message.includes('✅') ? 'green' : 'red' }}>{message}</span>}
      </div>
    </div>
  );
}

export default MasterResumeEditor;
