import { useState } from 'react';
import { Calendar, Plus, ChevronDown, Check, X } from 'lucide-react';

const COLORS = {
  primary: '#D8973C',
  secondary: '#BD632F',
  dark: '#273E47',
  lightBg: '#F5F5F5',
  white: '#FFFFFF',
};

const STATUS_OPTIONS = ['Applying', 'Applied', 'Interviewing', 'Negotiating', 'Accepted', 'No Response'];

function JobTrackerApp() {
  const [jobs, setJobs] = useState([
    {
      id: 1,
      position: 'Full Stack Developer',
      company: 'NDAX',
      url: 'https://example.com',
      description: 'Full stack role',
      maxSalary: 0,
      location: 'Calgary, AB (On-site)',
      status: 'Applied',
      dateSaved: '2023-09-12',
      deadline: null,
      dateApplied: '2023-10-10',
      cookedLevel: 3,
      followUp: null,
      tasks: ['Update resume', 'Prepare for interview'],
      completedTasks: []
    },
    {
      id: 2,
      position: 'Software Development Engineer Intern - 2024',
      company: 'Amazon',
      url: 'https://example.com',
      description: 'SDE intern role',
      maxSalary: 0,
      location: 'TBD',
      status: 'Applying',
      dateSaved: '2023-10-10',
      deadline: null,
      dateApplied: '2026-01-22',
      cookedLevel: 5,
      followUp: null,
      tasks: ['Research company', 'Tailor cover letter', 'Submit application'],
      completedTasks: ['Research company']
    },
    {
      id: 3,
      position: 'Software Engineering Intern',
      company: 'Duke',
      url: 'https://example.com',
      description: 'Software eng intern',
      maxSalary: 0,
      location: 'Remote',
      status: 'Interviewing',
      dateSaved: '2023-09-12',
      deadline: null,
      dateApplied: '2023-10-10',
      cookedLevel: 2,
      followUp: null,
      tasks: ['Follow up email'],
      completedTasks: []
    }
  ]);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  // Calculate progress for tracking bar
  const statusCounts = STATUS_OPTIONS.reduce((acc, status) => {
    acc[status] = jobs.filter(job => job.status === status).length;
    return acc;
  }, {});

  const totalJobs = jobs.length;
  const statusOrder = ['Applied', 'Interviewing', 'Negotiating', 'Accepted'];
  
  const getCumulativePercentage = (upToStatus) => {
    const index = statusOrder.indexOf(upToStatus);
    let count = 0;
    for (let i = 0; i <= index; i++) {
      count += statusCounts[statusOrder[i]] || 0;
    }
    return totalJobs > 0 ? (count / totalJobs) * 100 : 0;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;
    
    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleCellEdit = (jobId, field, value) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, [field]: value } : job
    ));
    setEditingCell(null);
    setEditValue('');
  };

  const handleStatusChange = (jobId, newStatus) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, status: newStatus } : job
    ));
  };

  const handleTaskToggle = (jobId, task) => {
    setJobs(jobs.map(job => {
      if (job.id === jobId) {
        const isCompleted = job.completedTasks.includes(task);
        return {
          ...job,
          completedTasks: isCompleted 
            ? job.completedTasks.filter(t => t !== task)
            : [...job.completedTasks, task]
        };
      }
      return job;
    }));
  };

  const handleAddTask = (jobId, newTask) => {
    if (newTask.trim()) {
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, tasks: [...job.tasks, newTask.trim()] } : job
      ));
    }
  };

  const handleCookedLevelChange = (jobId, level) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, cookedLevel: level } : job
    ));
  };

  const ModernProgressBar = () => (
    <div style={{ 
      marginBottom: '40px',
      background: COLORS.white,
      borderRadius: '16px',
      padding: '30px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
    }}>
      <h2 style={{ 
        margin: '0 0 20px 0', 
        color: COLORS.dark,
        fontSize: '20px',
        fontWeight: '600'
      }}>
        Application Progress
      </h2>
      
      <div style={{ 
        position: 'relative',
        height: '12px',
        background: COLORS.lightBg,
        borderRadius: '20px',
        overflow: 'hidden',
        marginBottom: '30px'
      }}>
        {statusOrder.map((status, idx) => {
          const percentage = getCumulativePercentage(status);
          const prevPercentage = idx > 0 ? getCumulativePercentage(statusOrder[idx - 1]) : 0;
          const colors = [COLORS.secondary, COLORS.primary, '#E8B55E', '#8FBC8F'];
          
          return (
            <div
              key={status}
              style={{
                position: 'absolute',
                left: `${prevPercentage}%`,
                width: `${percentage - prevPercentage}%`,
                height: '100%',
                background: colors[idx],
                transition: 'all 0.4s ease'
              }}
            />
          );
        })}
      </div>

      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px'
      }}>
        {statusOrder.map((status, idx) => {
          const count = statusCounts[status] || 0;
          const colors = [COLORS.secondary, COLORS.primary, '#E8B55E', '#8FBC8F'];
          
          return (
            <div
              key={status}
              style={{
                background: `linear-gradient(135deg, ${colors[idx]}15 0%, ${colors[idx]}05 100%)`,
                border: `2px solid ${colors[idx]}30`,
                borderRadius: '12px',
                padding: '20px',
                textAlign: 'center',
                transition: 'transform 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: colors[idx],
                marginBottom: '8px'
              }}>
                {count}
              </div>
              <div style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                fontWeight: '600',
                color: COLORS.dark,
                letterSpacing: '0.5px'
              }}>
                {status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const StatusDropdown = ({ job, rowIndex }) => {
    const isOpen = openDropdown === `status-${job.id}`;
    const isLastRows = rowIndex >= sortedJobs.length - 2;
    
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setOpenDropdown(isOpen ? null : `status-${job.id}`)}
          style={{
            padding: '8px 14px',
            background: COLORS.white,
            border: `2px solid ${COLORS.primary}`,
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            color: COLORS.dark,
            whiteSpace: 'nowrap'
          }}
        >
          {job.status}
          <ChevronDown size={16} />
        </button>
        {isOpen && (
          <>
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9
              }}
              onClick={() => setOpenDropdown(null)}
            />
            <div style={{
              position: 'absolute',
              [isLastRows ? 'bottom' : 'top']: '100%',
              left: 0,
              background: COLORS.white,
              border: `2px solid ${COLORS.primary}`,
              borderRadius: '8px',
              marginTop: isLastRows ? '0' : '4px',
              marginBottom: isLastRows ? '4px' : '0',
              zIndex: 10,
              minWidth: '160px',
              boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
            }}>
              {STATUS_OPTIONS.map(status => (
                <div
                  key={status}
                  onClick={() => {
                    handleStatusChange(job.id, status);
                    setOpenDropdown(null);
                  }}
                  style={{
                    padding: '10px 14px',
                    cursor: 'pointer',
                    background: job.status === status ? `${COLORS.primary}15` : COLORS.white,
                    fontSize: '14px',
                    fontWeight: job.status === status ? '600' : '400',
                    color: COLORS.dark,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (job.status !== status) e.target.style.background = COLORS.lightBg;
                  }}
                  onMouseLeave={(e) => {
                    if (job.status !== status) e.target.style.background = COLORS.white;
                  }}
                >
                  {status}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  const TasksDropdown = ({ job, rowIndex }) => {
    const isOpen = openDropdown === `tasks-${job.id}`;
    const [newTask, setNewTask] = useState('');
    const isLastRows = rowIndex >= sortedJobs.length - 2;
    
    return (
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => {
            setOpenDropdown(isOpen ? null : `tasks-${job.id}`);
            setNewTask('');
          }}
          style={{
            padding: '8px 14px',
            background: COLORS.white,
            border: `2px solid ${COLORS.primary}`,
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            color: COLORS.dark,
            whiteSpace: 'nowrap'
          }}
        >
          Tasks ({job.completedTasks.length}/{job.tasks.length})
          <ChevronDown size={16} />
        </button>
        {isOpen && (
          <>
            <div 
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 9
              }}
              onClick={() => {
                setOpenDropdown(null);
                setNewTask('');
              }}
            />
            <div 
              style={{
                position: 'absolute',
                [isLastRows ? 'bottom' : 'top']: '100%',
                right: 0,
                background: COLORS.white,
                border: `2px solid ${COLORS.primary}`,
                borderRadius: '8px',
                marginTop: isLastRows ? '0' : '4px',
                marginBottom: isLastRows ? '4px' : '0',
                zIndex: 10,
                minWidth: '250px',
                maxWidth: '320px',
                boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '8px 0' }}>
                {job.tasks.length === 0 ? (
                  <div style={{ 
                    padding: '20px', 
                    textAlign: 'center', 
                    color: '#999',
                    fontSize: '14px'
                  }}>
                    No tasks yet
                  </div>
                ) : (
                  job.tasks.map(task => (
                    <div
                      key={task}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskToggle(job.id, task);
                      }}
                      style={{
                        padding: '10px 14px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '14px',
                        textDecoration: job.completedTasks.includes(task) ? 'line-through' : 'none',
                        color: job.completedTasks.includes(task) ? '#999' : COLORS.dark,
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = COLORS.lightBg}
                      onMouseLeave={(e) => e.currentTarget.style.background = COLORS.white}
                    >
                      <div style={{
                        width: '18px',
                        height: '18px',
                        border: `2px solid ${COLORS.primary}`,
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: job.completedTasks.includes(task) ? COLORS.primary : COLORS.white,
                        transition: 'all 0.2s ease',
                        flexShrink: 0
                      }}>
                        {job.completedTasks.includes(task) && <Check size={14} color={COLORS.white} strokeWidth={3} />}
                      </div>
                      <span style={{ flex: 1, wordBreak: 'break-word' }}>{task}</span>
                    </div>
                  ))
                )}
              </div>
              <div style={{ 
                borderTop: `2px solid ${COLORS.lightBg}`, 
                padding: '12px',
                background: `${COLORS.lightBg}50`
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Add new task..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      e.stopPropagation();
                      if (e.key === 'Enter' && newTask.trim()) {
                        handleAddTask(job.id, newTask);
                        setNewTask('');
                      }
                    }}
                    style={{
                      flex: 1,
                      padding: '8px',
                      border: `2px solid ${COLORS.primary}30`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border 0.2s ease',
                      color: COLORS.dark
                    }}
                    onFocus={(e) => e.target.style.borderColor = COLORS.primary}
                    onBlur={(e) => e.target.style.borderColor = `${COLORS.primary}30`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (newTask.trim()) {
                        handleAddTask(job.id, newTask);
                        setNewTask('');
                      }
                    }}
                    style={{
                      padding: '8px 12px',
                      background: COLORS.primary,
                      color: COLORS.white,
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const EditableCell = ({ job, field, value }) => {
    const isEditing = editingCell === `${job.id}-${field}`;
    
    if (isEditing) {
      return (
        <input
          type={field.includes('Salary') ? 'number' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCellEdit(job.id, field, field.includes('Salary') ? parseFloat(editValue) || 0 : editValue);
            }
            if (e.key === 'Escape') {
              setEditingCell(null);
              setEditValue('');
            }
          }}
          onBlur={() => {
            setEditingCell(null);
            setEditValue('');
          }}
          autoFocus
          style={{
            width: '100%',
            padding: '8px',
            border: `2px solid ${COLORS.primary}`,
            borderRadius: '6px',
            fontSize: '14px',
            outline: 'none',
            color: COLORS.dark
          }}
        />
      );
    }
    
    return (
      <div
        onClick={() => {
          setEditingCell(`${job.id}-${field}`);
          setEditValue(value || '');
        }}
        style={{
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '6px',
          minHeight: '20px',
          transition: 'background 0.15s ease',
          color: COLORS.dark
        }}
        onMouseEnter={(e) => e.target.style.background = COLORS.lightBg}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        {field.includes('Salary') ? `$${value || 0}` : (value || 'N/A')}
      </div>
    );
  };

  const DatePickerCell = ({ job, field, value }) => {
    return (
      <input
        type="date"
        value={value || ''}
        onChange={(e) => handleCellEdit(job.id, field, e.target.value)}
        style={{
          padding: '8px',
          border: value ? `1px solid ${COLORS.lightBg}` : `2px solid ${COLORS.primary}30`,
          borderRadius: '6px',
          fontSize: '14px',
          cursor: 'pointer',
          background: COLORS.white,
          outline: 'none',
          transition: 'border 0.2s ease',
          color: COLORS.dark
        }}
        onFocus={(e) => e.target.style.borderColor = COLORS.primary}
        onBlur={(e) => e.target.style.borderColor = value ? `1px solid ${COLORS.lightBg}` : `${COLORS.primary}30`}
      />
    );
  };

  const StarRating = ({ job }) => {
    return (
      <div style={{ display: 'flex', gap: '4px' }}>
        {[1, 2, 3, 4, 5].map(level => (
          <span
            key={level}
            onClick={() => handleCookedLevelChange(job.id, level)}
            style={{
              cursor: 'pointer',
              fontSize: '22px',
              color: level <= job.cookedLevel ? COLORS.primary : '#ddd',
              transition: 'all 0.2s ease',
              transform: 'scale(1)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const TableHeader = ({ label, sortKey }) => (
    <th
      onClick={() => sortKey && handleSort(sortKey)}
      style={{
        padding: '18px 14px',
        textAlign: 'left',
        fontSize: '13px',
        fontWeight: '700',
        textTransform: 'uppercase',
        color: COLORS.dark,
        cursor: sortKey ? 'pointer' : 'default',
        background: sortConfig.key === sortKey ? `${COLORS.primary}15` : 'transparent',
        borderBottom: `3px solid ${sortConfig.key === sortKey ? COLORS.primary : COLORS.lightBg}`,
        position: 'relative',
        transition: 'all 0.2s ease',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap'
      }}
      onMouseEnter={(e) => {
        if (sortKey && sortConfig.key !== sortKey) {
          e.target.style.background = `${COLORS.lightBg}80`;
        }
      }}
      onMouseLeave={(e) => {
        if (sortKey && sortConfig.key !== sortKey) {
          e.target.style.background = 'transparent';
        }
      }}
    >
      {label}
      {sortKey && sortConfig.key === sortKey && (
        <span style={{ marginLeft: '6px', color: COLORS.primary }}>
          {sortConfig.direction === 'asc' ? '▲' : '▼'}
        </span>
      )}
    </th>
  );

  return (
    <div style={{ 
      padding: '20px',
      background: `linear-gradient(135deg, ${COLORS.lightBg} 0%, #E8E8E8 100%)`,
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <ModernProgressBar />
      
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => alert('Add New Job functionality - your friend is working on this!')}
          style={{
            padding: '14px 28px',
            background: `linear-gradient(135deg, ${COLORS.dark} 0%, ${COLORS.secondary} 100%)`,
            color: COLORS.white,
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '15px',
            fontWeight: '600',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
          <Plus size={20} />
          Add a New Job
        </button>
      </div>

      <div style={{
        background: COLORS.white,
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1200px' }}>
            <thead>
              <tr>
                <TableHeader label="Job Position" sortKey="position" />
                <TableHeader label="Company" sortKey="company" />
                <TableHeader label="Max. Salary" sortKey="maxSalary" />
                <TableHeader label="Location" sortKey="location" />
                <TableHeader label="Status" sortKey="status" />
                <TableHeader label="Date Saved" sortKey="dateSaved" />
                <TableHeader label="Deadline" sortKey="deadline" />
                <TableHeader label="Date Applied" sortKey="dateApplied" />
                <TableHeader label="Follow Up" sortKey="followUp" />
                <TableHeader label="Cooked" sortKey="cookedLevel" />
                <TableHeader label="Tasks" />
              </tr>
            </thead>
            <tbody>
              {sortedJobs.map((job, idx) => (
                <tr 
                  key={job.id} 
                  style={{ 
                    borderBottom: `1px solid ${COLORS.lightBg}`,
                    background: idx % 2 === 0 ? COLORS.white : `${COLORS.lightBg}30`,
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = `${COLORS.primary}08`}
                  onMouseLeave={(e) => e.currentTarget.style.background = idx % 2 === 0 ? COLORS.white : `${COLORS.lightBg}30`}
                >
                  <td style={{ padding: '16px 14px', fontSize: '14px', fontWeight: '500', color: COLORS.dark }}>{job.position}</td>
                  <td style={{ padding: '16px 14px', fontSize: '14px', color: COLORS.dark }}>{job.company}</td>
                  <td style={{ padding: '16px 14px', fontSize: '14px' }}>
                    <EditableCell job={job} field="maxSalary" value={job.maxSalary} />
                  </td>
                  <td style={{ padding: '16px 14px', fontSize: '14px' }}>
                    <EditableCell job={job} field="location" value={job.location} />
                  </td>
                  <td style={{ padding: '16px 14px' }}>
                    <StatusDropdown job={job} rowIndex={idx} />
                  </td>
                  <td style={{ padding: '16px 14px', fontSize: '14px' }}>
                    <DatePickerCell job={job} field="dateSaved" value={job.dateSaved} />
                  </td>
                  <td style={{ padding: '16px 14px', fontSize: '14px' }}>
                    <DatePickerCell job={job} field="deadline" value={job.deadline} />
                  </td>
                  <td style={{ padding: '16px 14px', fontSize: '14px' }}>
                    <DatePickerCell job={job} field="dateApplied" value={job.dateApplied} />
                  </td>
                  <td style={{ padding: '16px 14px', fontSize: '14px' }}>
                    <DatePickerCell job={job} field="followUp" value={job.followUp} />
                  </td>
                  <td style={{ padding: '16px 14px' }}>
                    <StarRating job={job} />
                  </td>
                  <td style={{ padding: '16px 14px' }}>
                    <TasksDropdown job={job} rowIndex={idx} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Warning */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        background: `${COLORS.primary}15`,
        borderLeft: `4px solid ${COLORS.primary}`,
        borderRadius: '8px',
        color: COLORS.dark,
        fontSize: '14px',
        display: 'none'
      }}
      className="mobile-warning"
      >
        📱 <strong>Note:</strong> For the best experience, please use a desktop or tablet device. Mobile optimization is in progress!
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-warning {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

export default JobTrackerApp;