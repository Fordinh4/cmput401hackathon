import React, { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import AddJobModal from "../components/AddJobModal";
import { Plus, Briefcase, ChevronDown } from "lucide-react";
import "./Home.css";

export default function Home() {
  // Modal state (your AddJobModal)
  const [open, setOpen] = useState(false);

  const handleSave = (job) => {
    console.log("Saved job:", job);
    // later: store to Firebase
  };

  const [jobs, setJobs] = useState([
    {
      id: 1,
      position: "Senior Frontend Developer",
      company: "TechCorp Inc.",
      url: "https://techcorp.com/careers",
      description: "React and TypeScript position",
      maxSalary: 120000,
      location: "Calgary, AB (Hybrid)",
      status: "Interviewing",
      dateSaved: "2026-01-10",
      deadline: "2026-01-25",
      dateApplied: "2026-01-12",
      cookedLevel: 5,
      followUp: "2026-01-20",
      tasks: ["Prepare portfolio", "Research company", "Practice coding questions"],
      completedTasks: ["Prepare portfolio", "Research company"],
    },
    {
      id: 2,
      position: "Full Stack Engineer",
      company: "StartupXYZ",
      url: "https://startupxyz.com",
      description: "Node.js and React",
      maxSalary: 95000,
      location: "Remote",
      status: "Applied",
      dateSaved: "2026-01-08",
      deadline: null,
      dateApplied: "2026-01-09",
      cookedLevel: 3,
      followUp: null,
      tasks: ["Send follow-up email"],
      completedTasks: [],
    },
    {
      id: 3,
      position: "Product Manager",
      company: "InnovateCo",
      url: "https://innovateco.com",
      description: "Lead product strategy",
      maxSalary: 110000,
      location: "Toronto, ON (On-site)",
      status: "No Response",
      dateSaved: "2026-01-05",
      deadline: "2026-01-15",
      dateApplied: "2026-01-06",
      cookedLevel: 2,
      followUp: null,
      tasks: [],
      completedTasks: [],
    },
  ]);

  const [editingCell, setEditingCell] = useState(null); // { jobId, field } | null
  const [editValue, setEditValue] = useState("");
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null); // jobId | null
  const [openTasksDropdown, setOpenTasksDropdown] = useState(null); // jobId | null
  const [newTask, setNewTask] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "position", direction: "asc" });

  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [tasksDropdownPos, setTasksDropdownPos] = useState({ top: 0, left: 0 });

  const statusRefs = useRef({});
  const tasksRefs = useRef({});

  const statusOptions = useMemo(
    () => ["Applying", "Applied", "Interviewing", "Negotiating", "Accepted", "No Response"],
    []
  );

  const statusColors = useMemo(
    () => ({
      Applying: "#9B59B6",
      Applied: "#BD632F",
      Interviewing: "#D8973C",
      Negotiating: "#E8B55E",
      Accepted: "#8FBC8F",
      "No Response": "#E74C3C",
    }),
    []
  );

  // Compute status counts (memoized)
  const statusCounts = useMemo(() => {
    const counts = {};
    statusOptions.forEach((status) => {
      counts[status] = jobs.filter((job) => job.status === status).length;
    });
    return counts;
  }, [jobs, statusOptions]);

  const totalJobs = jobs.length;

  // Current dropdown jobs
  const currentStatusJob = openStatusDropdown
    ? jobs.find((j) => j.id === openStatusDropdown)
    : null;

  // Update dropdown position when opened (Status)
  useEffect(() => {
    if (openStatusDropdown && statusRefs.current[openStatusDropdown]) {
      const rect = statusRefs.current[openStatusDropdown].getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [openStatusDropdown]);

  // Update dropdown position when opened (Tasks)
  useEffect(() => {
    if (openTasksDropdown && tasksRefs.current[openTasksDropdown]) {
      const rect = tasksRefs.current[openTasksDropdown].getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 280; // min-width of tasks dropdown

      let left = rect.left + window.scrollX;
      if (left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 20; // 20px margin from edge
      }

      setTasksDropdownPos({
        top: rect.bottom + window.scrollY,
        left,
      });
    }
  }, [openTasksDropdown]);

  // Close dropdowns on ESC
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpenStatusDropdown(null);
        setOpenTasksDropdown(null);
        if (editingCell) {
          setEditingCell(null);
          setEditValue("");
        }
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingCell]);

  // Close dropdowns on scroll/resize (keeps portals from “floating away”)
  useEffect(() => {
    const close = () => {
      setOpenStatusDropdown(null);
      setOpenTasksDropdown(null);
    };
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, []);

  // Sorting: compute sorted list from jobs + sortConfig (do NOT mutate jobs order in state)
  const sortedJobs = useMemo(() => {
    const key = sortConfig.key;
    const dir = sortConfig.direction;

    const sorted = [...jobs].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      // numeric sorts
      if (key === "maxSalary" || key === "cookedLevel") {
        aVal = aVal || 0;
        bVal = bVal || 0;
        return dir === "asc" ? aVal - bVal : bVal - aVal;
      }

      // nulls last
      if (aVal === null || aVal === undefined || aVal === "") return 1;
      if (bVal === null || bVal === undefined || bVal === "") return -1;

      // string compare
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return dir === "asc" ? -1 : 1;
      if (aVal > bVal) return dir === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [jobs, sortConfig]);

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Inline editing
  const startEdit = (jobId, field, currentValue) => {
    setEditingCell({ jobId, field });
    setEditValue(currentValue ?? "");
  };

  const saveEdit = (jobId, field) => {
    setJobs(
      jobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              [field]: field === "maxSalary" ? Number(editValue || 0) : editValue,
            }
          : job
      )
    );
    setEditingCell(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  // Status change
  const updateStatus = (jobId, newStatus) => {
    setJobs(jobs.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job)));
    setOpenStatusDropdown(null);
  };

  // Date updates
  const updateDate = (jobId, field, value) => {
    setJobs(jobs.map((job) => (job.id === jobId ? { ...job, [field]: value || null } : job)));
  };

  // Star rating
  const updateRating = (jobId, rating) => {
    setJobs(jobs.map((job) => (job.id === jobId ? { ...job, cookedLevel: rating } : job)));
  };

  // Task management
  const toggleTask = (jobId, task) => {
    setJobs(
      jobs.map((job) => {
        if (job.id === jobId) {
          const isCompleted = job.completedTasks.includes(task);
          return {
            ...job,
            completedTasks: isCompleted
              ? job.completedTasks.filter((t) => t !== task)
              : [...job.completedTasks, task],
          };
        }
        return job;
      })
    );
  };

  const addTask = (jobId) => {
    if (!jobId) return;
    if (newTask.trim()) {
      setJobs(
        jobs.map((job) =>
          job.id === jobId ? { ...job, tasks: [...job.tasks, newTask.trim()] } : job
        )
      );
      setNewTask("");
    }
  };

  const getCurrentJob = (jobId) => jobs.find((j) => j.id === jobId);

  const addNewJob = () => {
    const today = new Date().toISOString().split("T")[0];
    const newJob = {
      id: Date.now(),
      position: "New Position",
      company: "Company Name",
      url: "",
      description: "",
      maxSalary: 0,
      location: "TBD",
      status: "Applying",
      dateSaved: today,
      deadline: null,
      dateApplied: "",
      cookedLevel: 1,
      followUp: null,
      tasks: [],
      completedTasks: [],
    };
    setJobs([newJob, ...jobs]);
  };

  return (
    <div className="app-shell">
      {/* Simple button (kept from your original) */}
      <button onClick={() => setOpen(true)}>+ Add Job</button>

      <AddJobModal isOpen={open} onClose={() => setOpen(false)} onSave={handleSave} />

      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="header-content">
            <div className="header-title">
              <Briefcase className="header-icon" />
              <h1>Job Application Tracker</h1>
            </div>
            <button className="add-job-btn" onClick={addNewJob}>
              <Plus size={20} />
              Add New Job
            </button>
          </div>
        </header>

        {/* Dashboard */}
        <div className="dashboard">
          {/* Progress Bar */}
          <div className="progress-container">
            <h2 className="progress-title">Application Progress</h2>
            <div className="progress-bar">
              {statusOptions.map((status) => {
                const count = statusCounts[status] || 0;
                const percentage = totalJobs > 0 ? (count / totalJobs) * 100 : 0;
                return (
                  <div
                    key={status}
                    className="progress-segment"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: statusColors[status],
                      opacity: count === 0 ? 0.3 : 1,
                    }}
                    title={`${status}: ${count}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Status Cards */}
          <div className="status-cards">
            {statusOptions.map((status) => (
              <div
                key={status}
                className="status-card"
                style={{
                  background: `linear-gradient(135deg, ${statusColors[status]}15, ${statusColors[status]}30)`,
                }}
              >
                <div className="status-card-header" style={{ color: statusColors[status] }}>
                  {status}
                </div>
                <div className="status-card-count">{statusCounts[status] || 0}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <div className="table-wrapper">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th
                    onClick={() => handleSort("position")}
                    className={sortConfig.key === "position" ? "sorted-column" : ""}
                  >
                    Position{" "}
                    {sortConfig.key === "position" && (
                      <span className="sort-indicator">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("company")}
                    className={sortConfig.key === "company" ? "sorted-column" : ""}
                  >
                    Company{" "}
                    {sortConfig.key === "company" && (
                      <span className="sort-indicator">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("maxSalary")}
                    className={sortConfig.key === "maxSalary" ? "sorted-column" : ""}
                  >
                    Max Salary{" "}
                    {sortConfig.key === "maxSalary" && (
                      <span className="sort-indicator">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("location")}
                    className={sortConfig.key === "location" ? "sorted-column" : ""}
                  >
                    Location{" "}
                    {sortConfig.key === "location" && (
                      <span className="sort-indicator">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("status")}
                    className={sortConfig.key === "status" ? "sorted-column" : ""}
                  >
                    Status{" "}
                    {sortConfig.key === "status" && (
                      <span className="sort-indicator">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("dateSaved")}
                    className={sortConfig.key === "dateSaved" ? "sorted-column" : ""}
                  >
                    Date Saved{" "}
                    {sortConfig.key === "dateSaved" && (
                      <span className="sort-indicator">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("deadline")}
                    className={sortConfig.key === "deadline" ? "sorted-column" : ""}
                  >
                    Deadline{" "}
                    {sortConfig.key === "deadline" && (
                      <span className="sort-indicator">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("dateApplied")}
                    className={sortConfig.key === "dateApplied" ? "sorted-column" : ""}
                  >
                    Date Applied{" "}
                    {sortConfig.key === "dateApplied" && (
                      <span className="sort-indicator">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("followUp")}
                    className={sortConfig.key === "followUp" ? "sorted-column" : ""}
                  >
                    Follow Up{" "}
                    {sortConfig.key === "followUp" && (
                      <span className="sort-indicator">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th
                    onClick={() => handleSort("cookedLevel")}
                    className={sortConfig.key === "cookedLevel" ? "sorted-column" : ""}
                  >
                    Cooked Level{" "}
                    {sortConfig.key === "cookedLevel" && (
                      <span className="sort-indicator">
                        {sortConfig.direction === "asc" ? "▲" : "▼"}
                      </span>
                    )}
                  </th>
                  <th>Tasks</th>
                </tr>
              </thead>

              <tbody>
                {sortedJobs.map((job) => (
                  <tr key={job.id}>
                    <td
                      className="editable-cell"
                      onClick={() => !editingCell && startEdit(job.id, "position", job.position)}
                    >
                      {editingCell?.jobId === job.id && editingCell?.field === "position" ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(job.id, "position")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(job.id, "position");
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                          className="edit-input"
                        />
                      ) : (
                        job.position
                      )}
                    </td>

                    <td
                      className="editable-cell"
                      onClick={() => !editingCell && startEdit(job.id, "company", job.company)}
                    >
                      {editingCell?.jobId === job.id && editingCell?.field === "company" ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(job.id, "company")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(job.id, "company");
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                          className="edit-input"
                        />
                      ) : (
                        job.company
                      )}
                    </td>

                    <td
                      className="editable-cell"
                      onClick={() => !editingCell && startEdit(job.id, "maxSalary", job.maxSalary)}
                    >
                      {editingCell?.jobId === job.id && editingCell?.field === "maxSalary" ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(job.id, "maxSalary")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(job.id, "maxSalary");
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                          className="edit-input"
                        />
                      ) : (
                        `$${Number(job.maxSalary || 0).toLocaleString()}`
                      )}
                    </td>

                    <td
                      className="editable-cell"
                      onClick={() => !editingCell && startEdit(job.id, "location", job.location)}
                    >
                      {editingCell?.jobId === job.id && editingCell?.field === "location" ? (
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => saveEdit(job.id, "location")}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEdit(job.id, "location");
                            if (e.key === "Escape") cancelEdit();
                          }}
                          autoFocus
                          className="edit-input"
                        />
                      ) : (
                        job.location
                      )}
                    </td>

                    <td>
                      <div
                        ref={(el) => (statusRefs.current[job.id] = el)}
                        className="status-dropdown-trigger"
                        style={{
                          backgroundColor: `${statusColors[job.status]}20`,
                          color: statusColors[job.status],
                          borderColor: statusColors[job.status],
                        }}
                        onClick={() =>
                          setOpenStatusDropdown(openStatusDropdown === job.id ? null : job.id)
                        }
                      >
                        {job.status}
                        <ChevronDown size={16} />
                      </div>
                    </td>

                    <td>
                      <input
                        type="date"
                        value={job.dateSaved || ""}
                        onChange={(e) => updateDate(job.id, "dateSaved", e.target.value)}
                        className="date-input"
                      />
                    </td>

                    <td>
                      <input
                        type="date"
                        value={job.deadline || ""}
                        onChange={(e) => updateDate(job.id, "deadline", e.target.value)}
                        className="date-input"
                      />
                    </td>

                    <td>
                      <input
                        type="date"
                        value={job.dateApplied || ""}
                        onChange={(e) => updateDate(job.id, "dateApplied", e.target.value)}
                        className="date-input"
                      />
                    </td>

                    <td>
                      <input
                        type="date"
                        value={job.followUp || ""}
                        onChange={(e) => updateDate(job.id, "followUp", e.target.value)}
                        className="date-input"
                      />
                    </td>

                    <td>
                      <div className="star-rating">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`star ${star <= job.cookedLevel ? "star-filled" : ""}`}
                            onClick={() => updateRating(job.id, star)}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <div
                        ref={(el) => (tasksRefs.current[job.id] = el)}
                        className="tasks-trigger"
                        onClick={() =>
                          setOpenTasksDropdown(openTasksDropdown === job.id ? null : job.id)
                        }
                      >
                        Tasks ({job.completedTasks.length}/{job.tasks.length})
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Status Dropdown Portal */}
        {openStatusDropdown &&
          createPortal(
            <>
              <div className="dropdown-overlay" onClick={() => setOpenStatusDropdown(null)} />
              <div
                className="status-dropdown"
                style={{
                  position: "absolute",
                  top: dropdownPos.top,
                  left: dropdownPos.left,
                }}
              >
                {statusOptions.map((status) => (
                  <div
                    key={status}
                    className="status-option"
                    style={{
                      backgroundColor:
                        currentStatusJob?.status === status
                          ? `${statusColors[status]}20`
                          : "transparent",
                      color: statusColors[status],
                    }}
                    onClick={() => updateStatus(openStatusDropdown, status)}
                  >
                    {status}
                  </div>
                ))}
              </div>
            </>,
            document.body
          )}

        {/* Tasks Dropdown Portal */}
        {openTasksDropdown &&
          createPortal(
            <>
              <div className="dropdown-overlay" onClick={() => setOpenTasksDropdown(null)} />
              <div
                className="tasks-dropdown"
                style={{
                  position: "absolute",
                  top: tasksDropdownPos.top,
                  left: tasksDropdownPos.left,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="tasks-list">
                  {(() => {
                    const currentJob = getCurrentJob(openTasksDropdown);
                    if (!currentJob || currentJob.tasks.length === 0) {
                      return <div className="no-tasks">No tasks yet</div>;
                    }
                    return currentJob.tasks.map((task, i) => (
                      <div key={`${task}-${i}`} className="task-item">
                        <label className="task-checkbox">
                          <input
                            type="checkbox"
                            checked={currentJob.completedTasks.includes(task)}
                            onChange={() => toggleTask(openTasksDropdown, task)}
                          />
                          <span
                            className={
                              currentJob.completedTasks.includes(task) ? "task-completed" : ""
                            }
                          >
                            {task}
                          </span>
                        </label>
                      </div>
                    ));
                  })()}
                </div>

                <div className="add-task">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addTask(openTasksDropdown);
                    }}
                    placeholder="New task..."
                    className="task-input"
                  />
                  <button onClick={() => addTask(openTasksDropdown)} className="add-task-btn">
                    Add
                  </button>
                </div>
              </div>
            </>,
            document.body
          )}
      </div>
    </div>
  );
}
