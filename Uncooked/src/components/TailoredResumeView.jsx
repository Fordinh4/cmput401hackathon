import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ResumeEditor from './ResumeEditor';

const API_BASE = 'http://localhost:8000/api';

function TailoredResumeView() {
  const { id } = useParams();
  const [tailoredResume, setTailoredResume] = useState(null);
  const [currentHtml, setCurrentHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [checking, setChecking] = useState(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    fetchTailoredResume();
  }, [id]);

  const fetchTailoredResume = async () => {
    try {
      const response = await fetch(`${API_BASE}/resume/tailored/${id}/`);
      const data = await response.json();
      setTailoredResume(data);
      setCurrentHtml(data.current_html || '');
    } catch (error) {
      console.error('Error fetching tailored resume:', error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced auto-save function
  const debouncedSave = useCallback((html) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setAutoSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`${API_BASE}/resume/tailored/${id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            current_html: html,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setTailoredResume(data);
        }
      } catch (error) {
        console.error('Error auto-saving:', error);
      } finally {
        setAutoSaving(false);
      }
    }, 1500); // Wait 1.5 seconds after user stops typing
  }, [id]);

  const saveChanges = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE}/resume/tailored/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          current_html: currentHtml,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setTailoredResume(data);
        alert('✅ Changes saved!');
      } else {
        alert('❌ Failed to save changes');
      }
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('❌ Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  const checkImprovements = async () => {
    setChecking(true);
    try {
      const response = await fetch(`${API_BASE}/resume/tailored/${id}/check_improvements/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Check if response has a message (no changes detected)
        if (data.message) {
          alert(`ℹ️ ${data.message}`);
          return;
        }
        
        setTailoredResume(data);
        
        // Show feedback based on score change
        const prevScore = tailoredResume.current_cookedness_score || tailoredResume.initial_cookedness_score || 100;
        const newScore = data.current_cookedness_score || 100;
        const scoreChange = newScore - prevScore;
        
        if (scoreChange < 0) {
          alert(`✅ Great work! Score improved from ${prevScore} to ${newScore} (${Math.abs(scoreChange)} points better!)`);
        } else if (scoreChange > 0) {
          alert(`⚠️ Score went from ${prevScore} to ${newScore} (${scoreChange} points worse). Keep working on the suggestions!`);
        } else {
          alert(`ℹ️ Score unchanged at ${newScore}. Review the new suggestions for more improvements.`);
        }
      } else {
        const error = await response.json();
        alert(`❌ Failed to check improvements: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error checking improvements:', error);
      alert('❌ Error checking improvements');
    } finally {
      setChecking(false);
    }
  };


  const handleHtmlChange = (newHtml) => {
    setCurrentHtml(newHtml);
    debouncedSave(newHtml);
  };

  const downloadPDF = async () => {
    setDownloading(true);
    try {
      const response = await fetch(`${API_BASE}/resume/tailored/${id}/compile_pdf/`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const fileName = tailoredResume.job_application?.position 
          ? `resume_${tailoredResume.job_application.position}.pdf` 
          : 'tailored_resume.pdf';
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const error = await response.json();
        alert(`❌ PDF compilation failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('❌ Error downloading PDF');
    } finally {
      setDownloading(false);
    }
  };

  // Cooked Level: LOWER is BETTER (0=uncooked/raw, 100=overcooked/burnt)
  const getCookedColor = (level) => {
    if (level <= 20) return '#28a745'; // Green - barely cooked, authentic!
    if (level <= 50) return '#D8973C'; // Orange/yellow - getting cooked
    if (level <= 80) return '#BD632F'; // Burnt orange - pretty cooked
    return '#dc3545'; // Red - overcooked/burnt
  };

  const getCookedLabel = (level) => {
    if (level <= 20) return '🥩 RAW & AUTHENTIC!';
    if (level <= 50) return '🔥 Lightly Cooked';
    if (level <= 80) return '🍖 Getting Overcooked...';
    return '🔥💥 BURNT! Too AI-like';
  };

  const getCookedEmoji = (level) => {
    if (level <= 20) return '🥩'; // steak - raw
    if (level <= 50) return '🍳'; // cooking
    if (level <= 80) return '🍖'; // meat on bone
    return '🔥'; // fire - burnt
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (!tailoredResume) {
    return <div style={{ padding: '20px' }}>Tailored resume not found</div>;
  }

  const cookedLevel = tailoredResume.cooked_level || tailoredResume.coolness_level || 100;

  return (
    <div style={{ 
      backgroundColor: '#F5F5F5', 
      minHeight: '100vh',
      width: '100%',
      padding: '0',
      margin: '0'
    }}>
      {/* Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #273E47, #BD632F)',
        borderRadius: '0',
        padding: '30px 40px',
        marginBottom: '0',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ 
            margin: '0', 
            fontSize: '32px', 
            color: 'white', 
            fontWeight: '700'
          }}>
            🎯 Tailored Resume Editor
          </h1>
          {tailoredResume.job_application && (
            <span style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontWeight: '400', 
              fontSize: '18px'
            }}>
              - {tailoredResume.job_application.position} at {tailoredResume.job_application.company_name}
            </span>
          )}
        </div>
      </div>
      
      <div style={{ width: '100%', margin: '0', padding: '20px' }}>

        {/* Cooked Level Meter */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '16px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <h2 style={{ 
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '20px',
            color: '#273E47'
          }}>
            Cookedness Score
          </h2>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '20px'
          }}>
            <div style={{ flex: '1', minWidth: '250px' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold', color: getCookedColor(cookedLevel), marginBottom: '8px' }}>
                {cookedLevel}%
              </div>
              {autoSaving && (
                <div style={{ fontSize: '13px', color: '#D8973C', marginBottom: '8px', fontWeight: '600' }}>
                  💾 Auto-saving...
                </div>
              )}
              <p style={{ margin: '0', color: '#7f8c8d', fontSize: '14px', lineHeight: '1.6' }}>
                <strong style={{ color: '#273E47' }}>Goal: 0-20 (Raw & Authentic)</strong><br/>
                Lower score = Better tailoring
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '64px', marginBottom: '8px' }}>
                {getCookedEmoji(cookedLevel)}
              </div>
              <div style={{ 
                fontSize: '16px',
                fontWeight: '600',
                color: getCookedColor(cookedLevel)
              }}>
                {getCookedLabel(cookedLevel)}
              </div>
            </div>
          </div>
          <div style={{
            height: '40px',
            backgroundColor: '#e0e0e0',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              width: `${cookedLevel}%`,
              height: '100%',
              backgroundColor: getCookedColor(cookedLevel),
              transition: 'all 0.4s ease'
            }} />
          </div>
        </div>

        {/* Action Buttons Row */}
        <div style={{ 
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <div style={{ 
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={saveChanges}
              disabled={saving}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #273E47, #BD632F)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: saving ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                opacity: saving ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                }
              }}
            >
              {saving ? 'Saving...' : '💾 Save Changes'}
            </button>
            <button
              onClick={checkImprovements}
              disabled={checking}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #273E47, #BD632F)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: checking ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                opacity: checking ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!checking) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!checking) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                }
              }}
            >
              {checking ? 'Checking...' : '✅ Check Score'}
            </button>
            <button
              onClick={downloadPDF}
              disabled={downloading}
              style={{
                padding: '14px 28px',
                background: 'linear-gradient(135deg, #273E47, #BD632F)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: downloading ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: '600',
                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                opacity: downloading ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!downloading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!downloading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
                }
              }}
            >
              {downloading ? 'Compiling...' : '📄 Download PDF'}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
          gap: '20px',
          '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr'
          }
        }}>
          {/* AI Suggestions Sidebar (LEFT) */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              position: window.innerWidth > 768 ? 'sticky' : 'relative',
              top: '20px',
              maxHeight: window.innerWidth > 768 ? 'calc(100vh - 40px)' : 'none',
              overflowY: window.innerWidth > 768 ? 'auto' : 'visible'
            }}>
              <h3 style={{ 
                margin: '0 0 20px 0',
                fontSize: '20px',
                color: '#273E47',
                fontWeight: '600'
              }}>
                💡 AI Suggestions
              </h3>
            
            {tailoredResume.ai_suggestions && tailoredResume.ai_suggestions.length > 0 ? (
              <div>
                {tailoredResume.ai_suggestions.map((suggestion, index) => {
                  const priorityColors = {
                    high: '#e74c3c',
                    medium: '#f39c12',
                    low: '#3498db'
                  };
                  const priorityColor = priorityColors[suggestion.priority] || '#7f8c8d';
                  
                  return (
                    <div 
                      key={index} 
                      onClick={() => {
                        setSelectedSuggestion(suggestion);
                        setShowModal(true);
                      }}
                      style={{
                        marginBottom: '12px',
                        padding: '16px',
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                        borderLeft: `3px solid ${priorityColor}`,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f0f0';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#fafafa';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                      }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: priorityColor,
                          textTransform: 'uppercase'
                        }}>
                          {suggestion.priority || 'medium'}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: '#7f8c8d',
                          backgroundColor: 'white',
                          padding: '2px 8px',
                          borderRadius: '4px'
                        }}>
                          {suggestion.category || 'general'}
                        </span>
                      </div>
                      <p style={{
                        margin: 0,
                        fontSize: '14px',
                        lineHeight: '1.5',
                        color: '#2c3e50'
                      }}>
                        {suggestion.suggestion}
                      </p>
                      {suggestion.suggested_text && (
                        <div style={{
                          marginTop: '8px',
                          fontSize: '11px',
                          color: '#27ae60',
                          fontWeight: '600'
                        }}>
                          👆 Click to see exact text
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#7f8c8d', fontSize: '14px', fontStyle: 'italic' }}>
                No suggestions yet. Make some changes and click "Check Improvements" to get feedback!
              </p>
            )}
            
            {/* Improvement History */}
            {evaluation && evaluation.followed_suggestions && evaluation.followed_suggestions.length > 0 && (
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e9ecef' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#27ae60' }}>
                  ✅ Completed Suggestions
                </h4>
                {evaluation.followed_suggestions.map((suggestion, index) => (
                  <div key={index} style={{
                    marginBottom: '8px',
                    padding: '8px',
                    backgroundColor: '#d4edda',
                    borderRadius: '6px',
                    fontSize: '13px',
                    color: '#155724'
                  }}>
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

          {/* Resume Editor (RIGHT) */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              fontSize: '20px',
              color: '#273E47',
              backgroundColor: 'white',
              padding: '20px',
              margin: 0,
              fontWeight: '600',
              borderBottom: '1px solid #e0e0e0'
            }}>
              ✏️ Resume Editor
            </div>
            <ResumeEditor
              content={currentHtml}
              onChange={handleHtmlChange}
              readOnly={false}
            />
          </div>
        </div>

        {/* Tip Section */}
        <div style={{ 
          marginTop: '20px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#273E47', marginBottom: '12px' }}>
            💡 How to Use
          </h3>
          <p style={{ margin: '0', color: '#7f8c8d', lineHeight: '1.6', fontSize: '14px' }}>
            1. Click on AI suggestions to see exact text to add<br/>
            2. Copy and paste the text into your resume editor<br/>
            3. Click "Check Score" to get re-evaluated<br/>
            4. Keep improving until you reach <strong style={{ color: '#27ae60' }}>0-20 (Raw & Authentic!)</strong> 🥩
          </p>
        </div>
      </div>

      {/* Modal for Suggestion Details */}
      {showModal && selectedSuggestion && (
        <div
          onClick={() => setShowModal(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
              position: 'relative'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#7f8c8d',
                lineHeight: '1'
              }}
            >
              ×
            </button>

            {/* Priority badge */}
            <div style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              marginBottom: '15px',
              backgroundColor: selectedSuggestion.priority === 'high' ? '#e74c3c' : 
                               selectedSuggestion.priority === 'medium' ? '#f39c12' : '#3498db',
              color: 'white'
            }}>
              {selectedSuggestion.priority || 'medium'} priority
            </div>

            {/* Category */}
            <div style={{
              fontSize: '13px',
              color: '#7f8c8d',
              marginBottom: '15px',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}>
              📂 {selectedSuggestion.category || 'general'}
            </div>

            {/* Suggestion description */}
            <h3 style={{
              margin: '0 0 15px 0',
              fontSize: '18px',
              color: '#273E47',
              lineHeight: '1.5'
            }}>
              {selectedSuggestion.suggestion}
            </h3>

            {/* Exact text to add */}
            {selectedSuggestion.suggested_text && (
              <div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: '#273E47',
                  marginBottom: '10px',
                  marginTop: '20px'
                }}>
                  ✏️ Exact text to add to your resume:
                </div>
                <div style={{
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px solid #D8973C',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#2c3e50',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  marginBottom: '15px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  {selectedSuggestion.suggested_text}
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedSuggestion.suggested_text);
                    alert('✅ Text copied to clipboard! Paste it into your resume.');
                  }}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    width: '100%',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  📋 Copy Text to Clipboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TailoredResumeView;
