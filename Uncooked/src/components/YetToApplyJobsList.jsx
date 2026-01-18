import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

function YetToApplyJobsList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState({});
  const [projectSuggestions, setProjectSuggestions] = useState(null);
  const [showSuggestionsModal, setShowSuggestionsModal] = useState(false);
  const [showResumeSelector, setShowResumeSelector] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [companyResumes, setCompanyResumes] = useState([]);
  const [loadingCompanyResumes, setLoadingCompanyResumes] = useState(false);
  const [deletingResume, setDeletingResume] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [resumeToDelete, setResumeToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchYetToApplyJobs();
  }, []);

  const fetchYetToApplyJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/jobs/yet_to_apply/`);
      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const showResumeChoiceModal = async (job) => {
    setSelectedJob(job);
    setLoadingCompanyResumes(true);
    setShowResumeSelector(true);
    
    try {
      // Fetch existing resumes for this company
      const response = await fetch(`${API_BASE}/resume/tailored/by-company/${encodeURIComponent(job.company_name)}/`);
      if (response.ok) {
        const data = await response.json();
        setCompanyResumes(data);
      }
    } catch (error) {
      console.error('Error fetching company resumes:', error);
    } finally {
      setLoadingCompanyResumes(false);
    }
  };
  
  const confirmDeleteResume = (resume, e) => {
    e.stopPropagation(); // Prevent triggering the card's onClick
    setResumeToDelete(resume);
    setShowDeleteConfirm(true);
  };
  
  const deleteResume = async () => {
    if (!resumeToDelete) return;
    
    setDeletingResume(resumeToDelete.id);
    setShowDeleteConfirm(false);
    
    try {
      const response = await fetch(`${API_BASE}/resume/tailored/${resumeToDelete.id}/`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        // Remove from local state
        setCompanyResumes(companyResumes.filter(r => r.id !== resumeToDelete.id));
      } else {
        console.error('Failed to delete resume');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
    } finally {
      setDeletingResume(null);
      setResumeToDelete(null);
    }
  };
  
  const generateTailoredResume = async (jobId, baseResumeId = null) => {
    setGenerating({ ...generating, [jobId]: true });
    setShowResumeSelector(false);
    
    try {
      const body = baseResumeId ? { base_resume_id: baseResumeId } : {};
      
      const response = await fetch(`${API_BASE}/resume/tailored/tailor/${jobId}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if we have relevant experience
        if (data.has_relevant_experience === false) {
          // Show project suggestions modal
          setProjectSuggestions(data);
          setShowSuggestionsModal(true);
        } else {
          // Navigate to the tailored resume view
          navigate(`/tailored/${data.id}`);
        }
      } else {
        const error = await response.json();
        alert(`Failed to generate resume: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error generating tailored resume:', error);
      alert('Failed to generate tailored resume. Make sure you have created a master resume first.');
    } finally {
      setGenerating({ ...generating, [jobId]: false });
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading jobs...</div>;
  }

  return (
    <div style={{ width: '100%', margin: '0', padding: '20px', backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #273E47, #BD632F)',
        borderRadius: '16px',
        padding: '30px',
        marginBottom: '30px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'white' }}>
          <div style={{ fontSize: '36px' }}>💼</div>
          <div>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '32px', fontWeight: '700' }}>Job Application Tracker</h1>
            <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
              Generate AI-tailored resumes for each job. Goal: Stay UNCOOKED! 🥩
            </p>
          </div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div style={{ 
          padding: '60px',
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📦</div>
          <h3 style={{ color: '#273E47', marginBottom: '10px', fontSize: '20px', fontWeight: '600' }}>No jobs yet!</h3>
          <p style={{ color: '#7f8c8d', fontSize: '14px' }}>Add some job applications with "yet_to_apply" status via Django admin to see them here.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              style={{
                borderRadius: '16px',
                padding: '30px',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '30px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#273E47', fontWeight: '700' }}>{job.position}</h2>
                  <h3 style={{ margin: '0 0 12px 0', color: '#BD632F', fontWeight: '600', fontSize: '18px' }}>
                    {job.company_name}
                  </h3>
                  <p style={{ color: '#7f8c8d', fontSize: '13px', marginBottom: '16px' }}>
                    📅 Added: {new Date(job.date_added).toLocaleDateString()}
                  </p>
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ 
                      color: '#273E47', 
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px'
                    }}>Description:</div>
                    <p style={{ 
                      marginTop: '0',
                      color: '#555',
                      whiteSpace: 'pre-wrap',
                      lineHeight: '1.6',
                      fontSize: '14px',
                      backgroundColor: '#fafafa',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid #e0e0e0'
                    }}>
                      {job.description.length > 300
                        ? job.description.substring(0, 300) + '...'
                        : job.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => showResumeChoiceModal(job)}
                  disabled={generating[job.id]}
                  style={{
                    padding: '14px 28px',
                    background: generating[job.id] ? '#95a5a6' : 'linear-gradient(135deg, #273E47, #BD632F)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: generating[job.id] ? 'not-allowed' : 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                    transition: 'all 0.3s ease',
                    opacity: generating[job.id] ? 0.7 : 1,
                    alignSelf: 'flex-start'
                  }}
                  onMouseEnter={(e) => {
                    if (!generating[job.id]) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!generating[job.id]) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                    }
                  }}
                >
                  {generating[job.id] ? '🔄 Cooking...' : '🤖 AI Tailor Resume'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Resume Selector Modal */}
      {showResumeSelector && selectedJob && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '700px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            borderTop: '6px solid #BD632F'
          }}>
            <div style={{ marginBottom: '25px' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#273E47', fontWeight: '700' }}>
                📝 Choose Base Resume
              </h2>
              <p style={{ color: '#7f8c8d', fontSize: '14px', marginBottom: '5px' }}>
                For: <strong style={{ color: '#273E47' }}>{selectedJob.position}</strong> at <strong style={{ color: '#BD632F' }}>{selectedJob.company_name}</strong>
              </p>
            </div>
            
            {loadingCompanyResumes ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#7f8c8d' }}>
                Loading previous resumes...
              </div>
            ) : (
              <div>
                {/* Master Resume Option */}
                <div
                  onClick={() => generateTailoredResume(selectedJob.id, null)}
                  style={{
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '12px',
                    marginBottom: '15px',
                    border: '2px solid #D8973C',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#e8f4f8';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#f8f9fa';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ fontSize: '28px' }}>📄</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#273E47', fontWeight: '600' }}>
                        Master Resume
                      </h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#7f8c8d' }}>
                        Start from your base master resume (recommended for first application)
                      </p>
                    </div>
                    <div style={{
                      padding: '6px 16px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      DEFAULT
                    </div>
                  </div>
                </div>
                
                {/* Previous Company Resumes */}
                {companyResumes.length > 0 && (
                  <div>
                    <div style={{ 
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#273E47',
                      marginBottom: '12px',
                      paddingLeft: '4px'
                    }}>
                      🏢 Previous resumes for {selectedJob.company_name}:
                    </div>
                    {companyResumes.map((resume) => (
                      <div
                        key={resume.id}
                        onClick={() => generateTailoredResume(selectedJob.id, resume.id)}
                        style={{
                          padding: '18px',
                          backgroundColor: '#ffffff',
                          borderRadius: '12px',
                          marginBottom: '12px',
                          border: '2px solid #e0e0e0',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f0f8ff';
                          e.currentTarget.style.borderColor = '#BD632F';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ffffff';
                          e.currentTarget.style.borderColor = '#e0e0e0';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                          <div style={{ fontSize: '24px' }}>📋</div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#273E47', fontWeight: '600' }}>
                              {resume.job_application.position}
                            </h3>
                            <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#7f8c8d', marginBottom: '8px' }}>
                              <span>🗓️ {new Date(resume.created_at).toLocaleDateString()}</span>
                              <span>🎯 Score: {resume.current_cookedness_score}%</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '12px', color: '#555', fontStyle: 'italic' }}>
                              Build upon this resume to save time!
                            </p>
                          </div>
                          <button
                            onClick={(e) => confirmDeleteResume(resume, e)}
                            disabled={deletingResume === resume.id}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: deletingResume === resume.id ? '#95a5a6' : '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: deletingResume === resume.id ? 'not-allowed' : 'pointer',
                              fontSize: '12px',
                              fontWeight: '600',
                              transition: 'all 0.2s ease',
                              opacity: deletingResume === resume.id ? 0.6 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (deletingResume !== resume.id) {
                                e.currentTarget.style.backgroundColor = '#c82333';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (deletingResume !== resume.id) {
                                e.currentTarget.style.backgroundColor = '#dc3545';
                              }
                            }}
                          >
                            {deletingResume === resume.id ? '⏳' : '🗑️ Delete'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            <button
              onClick={() => setShowResumeSelector(false)}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                color: '#273E47',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                marginTop: '15px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && resumeToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '500px',
            width: '100%',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            borderTop: '6px solid #dc3545'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <div style={{ fontSize: '64px', marginBottom: '15px' }}>⚠️</div>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#273E47', fontWeight: '700' }}>
                Delete Resume?
              </h2>
              <p style={{ color: '#7f8c8d', fontSize: '14px', margin: '10px 0' }}>
                Are you sure you want to delete the resume for:
              </p>
              <p style={{ color: '#273E47', fontSize: '16px', fontWeight: '600', margin: '10px 0' }}>
                {resumeToDelete.job_application.position}
              </p>
              <p style={{ color: '#BD632F', fontSize: '14px', fontWeight: '600', margin: '5px 0' }}>
                at {resumeToDelete.job_application.company_name}
              </p>
              <p style={{ color: '#dc3545', fontSize: '13px', marginTop: '15px', fontWeight: '600' }}>
                ⚠️ This action cannot be undone!
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setResumeToDelete(null);
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#f8f9fa',
                  color: '#273E47',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e8e9ea';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                }}
              >
                Cancel
              </button>
              <button
                onClick={deleteResume}
                style={{
                  flex: 1,
                  padding: '14px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 8px rgba(220, 53, 69, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c82333';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(220, 53, 69, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#dc3545';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)';
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Project Suggestions Modal */}
      {showSuggestionsModal && projectSuggestions && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'auto',
            padding: '30px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            borderTop: '6px solid #BD632F'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '28px', color: '#273E47' }}>
                💡 Build Your Experience First!
              </h2>
              <p style={{ color: '#7f8c8d', fontSize: '16px', marginBottom: '10px' }}>
                {projectSuggestions.reason}
              </p>
              <p style={{ color: '#BD632F', fontSize: '15px', fontWeight: '600' }}>
                🚀 Here are some project ideas to build relevant experience:
              </p>
            </div>
            
            <div style={{ marginBottom: '25px' }}>
              {projectSuggestions.suggestions.map((project, idx) => (
                <div key={idx} style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '12px',
                  marginBottom: '15px',
                  border: '2px solid #D8973C'
                }}>
                  <h3 style={{ margin: '0 0 10px 0', color: '#273E47', fontSize: '20px' }}>
                    {idx + 1}. {project.title}
                  </h3>
                  <p style={{ color: '#555', lineHeight: '1.6', marginBottom: '12px' }}>
                    {project.description}
                  </p>
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ color: '#BD632F', fontSize: '14px' }}>Skills You'll Gain:</strong>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                      {project.skills_gained.map((skill, skillIdx) => (
                        <span key={skillIdx} style={{
                          backgroundColor: '#D8973C',
                          color: 'white',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '20px', fontSize: '14px', color: '#7f8c8d' }}>
                    <span>🕒 <strong>Time:</strong> {project.estimated_time}</span>
                    <span>🎯 <strong>Difficulty:</strong> {project.difficulty}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => {
                setShowSuggestionsModal(false);
                setProjectSuggestions(null);
              }}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#273E47',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              Got it! I'll work on these projects
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default YetToApplyJobsList;
