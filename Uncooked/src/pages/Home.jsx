import React, { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import AddJobModal from "../components/AddJobModal";
import { Plus, ChevronDown, X } from "lucide-react";
import "./Home.css";

export default function Home() {
  // Modal state (AddJobModal)
  const [open, setOpen] = useState(false);

  // Jobs from backend
  const [jobs, setJobs] = useState([]);

  // Loading jobs from database
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/jobs/");
        if (response.ok) {
          const data = await response.json();
          const mappedJobs = data.map((job) => ({
            id: job.id,
            position: job.job_title,
            company: job.company,
            url: job.url,
            description: job.job_description,
            maxSalary: job.max_salary || 0,
            location: job.location,
            status: job.status,
            // NOTE: your current mapping uses date_applied for dateSaved; keeping as-is
            dateSaved: job.date_applied
              ? job.date_applied.split("T")[0]
              : new Date().toISOString().slice(0, 10),
            deadline: job.deadline ? job.deadline.split("T")[0] : null,
            dateApplied: job.date_applied ? job.date_applied.split("T")[0] : null,
            cookedLevel: job.cooked_level || 0,
            followUp: job.follow_up ? job.follow_up.split("T")[0] : null,
            tasks: job.tasks?.tasks || [],
            completedTasks: job.tasks?.completedTasks || [],
          }));
          setJobs(mappedJobs);
        }
      } catch (error) {
        console.error("Error loading jobs:", error);
      }
    };

    fetchJobs();
  }, []);

  // Inline editing / dropdowns / sorting
  const [editingCell, setEditingCell] = useState(null); // { jobId, field } | null
  const [editValue, setEditValue] = useState("");
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null); // jobId | null
  const [openTasksDropdown, setOpenTasksDropdown] = useState(null); // jobId | null
  const [newTask, setNewTask] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "position", direction: "asc" });

  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [tasksDropdownPos, setTasksDropdownPos] = useState({ top: 0, left: 0 });

  // ✅ Selection + delete confirm (restored)
  const [selectedJobs, setSelectedJobs] = useState([]);
  useEffect(() => {
    console.log("selectedJobs:", selectedJobs);
  }, [selectedJobs]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // ✅ Save from modal -> send to backend & append into list
  const handleSave = async (jobFromModal) => {
    const today = new Date().toISOString().slice(0, 10);

    try {
      const response = await fetch("http://localhost:8000/api/jobs/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_title: jobFromModal.title,
          company: jobFromModal.company,
          url: jobFromModal.url,
          location: jobFromModal.location,
          job_description: jobFromModal.description,
          max_salary: jobFromModal.maxSalary || 0,
          status: jobFromModal.status,
          deadline: jobFromModal.deadline || null,
          follow_up: jobFromModal.followUp || null,
          date_applied: jobFromModal.dateApplied,
          cooked_level: 1,
          tasks: { tasks: [], completedTasks: [] },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error:", errorData);
        alert(`Error saving job: ${errorData.error || "Unknown error"}`);
        return;
      }

      const savedJob = await response.json();

      const newJob = {
        id: savedJob.id,
        position: jobFromModal.title?.trim() || "New Position",
        company: jobFromModal.company?.trim() || "Company",
        url: jobFromModal.url?.trim() || "",
        description: jobFromModal.description?.trim() || "",
        maxSalary: Number(jobFromModal.maxSalary || 0),
        location: jobFromModal.location?.trim() || "TBD",
        status: jobFromModal.status || "Applying",
        dateSaved: today,
        deadline: jobFromModal.deadline || null,
        dateApplied: jobFromModal.dateApplied || today,
        followUp: jobFromModal.followUp || null,
        cookedLevel: 1,
        tasks: [],
        completedTasks: [],
      };

      setJobs((prev) => [newJob, ...prev]);
      setOpen(false);
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Error saving job: " + error.message);
    }
  };

  // Compute status counts
  const statusCounts = useMemo(() => {
    const counts = {};
    statusOptions.forEach((status) => {
      counts[status] = jobs.filter((job) => job.status === status).length;
    });
    return counts;
  }, [jobs, statusOptions]);

  const totalJobs = jobs.length;

  const currentStatusJob = openStatusDropdown
    ? jobs.find((j) => j.id === openStatusDropdown)
    : null;

  // Dropdown position (Status)
  useEffect(() => {
    if (openStatusDropdown && statusRefs.current[openStatusDropdown]) {
      const rect = statusRefs.current[openStatusDropdown].getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
  }, [openStatusDropdown]);

  // Dropdown position (Tasks)
  useEffect(() => {
    if (openTasksDropdown && tasksRefs.current[openTasksDropdown]) {
      const rect = tasksRefs.current[openTasksDropdown].getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const dropdownWidth = 280;

      let left = rect.left + window.scrollX;
      if (left + dropdownWidth > viewportWidth) {
        left = viewportWidth - dropdownWidth - 20;
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
        if (showDeleteConfirm) setShowDeleteConfirm(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [editingCell, showDeleteConfirm]);

  // Close dropdowns on scroll/resize
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

  // Sorting: derive sorted list (don’t mutate state order)
  const sortedJobs = useMemo(() => {
    const key = sortConfig.key;
    const dir = sortConfig.direction;

    return [...jobs].sort((a, b) => {
      let aVal = a[key];
      let bVal = b[key];

      if (key === "maxSalary" || key === "cookedLevel") {
        aVal = aVal || 0;
        bVal = bVal || 0;
        return dir === "asc" ? aVal - bVal : bVal - aVal;
      }

      if (aVal === null || aVal === undefined || aVal === "") return 1;
      if (bVal === null || bVal === undefined || bVal === "") return -1;

      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return dir === "asc" ? -1 : 1;
      if (aVal > bVal) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [jobs, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => {
      const nextDir = prev.key === key && prev.direction === "asc" ? "desc" : "asc";
      return { key, direction: nextDir };
    });
  };

  // Inline editing
  const startEdit = (jobId, field, currentValue) => {
    setEditingCell({ jobId, field });
    setEditValue(currentValue ?? "");
  };

  const saveEdit = async (jobId, field) => {
    const newValue = field === "maxSalary" ? Number(editValue || 0) : editValue;
    
    // Update UI immediately
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId
          ? { ...job, [field]: newValue }
          : job
      )
    );
    setEditingCell(null);
    setEditValue("");
    
    // Save to backend
    try {
      const updateData = {};
      // Map frontend field names to backend field names
      if (field === 'maxSalary') updateData.max_salary = newValue;
      else if (field === 'company') updateData.company = newValue;
      else if (field === 'position') updateData.job_title = newValue;
      else if (field === 'location') updateData.location = newValue;
      else if (field === 'url') updateData.url = newValue;
      else updateData[field] = newValue;
      
      await fetch(`http://localhost:8000/api/jobs/${jobId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      console.error('Error saving edit:', error);
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue("");
  };

  // Status change
  const updateStatus = async (jobId, newStatus) => {
    // Update UI immediately for better UX
    setJobs((prev) => prev.map((job) => (job.id === jobId ? { ...job, status: newStatus } : job)));
    setOpenStatusDropdown(null);
    
    // Save to backend
    try {
      const response = await fetch(`http://localhost:8000/api/jobs/${jobId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        console.error('Failed to update status');
        // Optionally revert on failure
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Date updates
  const updateDate = async (jobId, field, value) => {
    // Update UI immediately
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, [field]: value || null } : job))
    );
    
    // Save to backend
    try {
      const updateData = {};
      // Map frontend field names to backend field names
      if (field === 'deadline') updateData.deadline = value || null;
      else if (field === 'followUp') updateData.follow_up = value || null;
      else updateData[field] = value || null;
      
      await fetch(`http://localhost:8000/api/jobs/${jobId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
    } catch (error) {
      console.error('Error updating date:', error);
    }
  };

  // Star rating
  const updateRating = async (jobId, rating) => {
    // Update UI immediately
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, cookedLevel: rating } : job))
    );
    
    // Save to backend
    try {
      await fetch(`http://localhost:8000/api/jobs/${jobId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cooked_level: rating }),
      });
    } catch (error) {
      console.error('Error updating rating:', error);
    }
  };

  // Task management
  const toggleTask = async (jobId, task) => {
    // Find current job to get updated completedTasks
    const currentJob = jobs.find(j => j.id === jobId);
    if (!currentJob) return;
    
    const isCompleted = currentJob.completedTasks.includes(task);
    const newCompletedTasks = isCompleted
      ? currentJob.completedTasks.filter((t) => t !== task)
      : [...currentJob.completedTasks, task];
    
    // Update UI immediately
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id !== jobId) return job;
        return {
          ...job,
          completedTasks: newCompletedTasks,
        };
      })
    );
    
    // Save to backend
    try {
      await fetch(`http://localhost:8000/api/jobs/${jobId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: {
            tasks: currentJob.tasks,
            completedTasks: newCompletedTasks
          }
        }),
      });
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const addTask = async (jobId) => {
    if (!jobId) return;
    if (!newTask.trim()) return;

    const currentJob = jobs.find(j => j.id === jobId);
    if (!currentJob) return;
    
    const newTasks = [...currentJob.tasks, newTask.trim()];
    
    // Update UI immediately
    setJobs((prev) =>
      prev.map((job) =>
        job.id === jobId ? { ...job, tasks: newTasks } : job
      )
    );
    setNewTask("");
    
    // Save to backend
    try {
      await fetch(`http://localhost:8000/api/jobs/${jobId}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: {
            tasks: newTasks,
            completedTasks: currentJob.completedTasks
          }
        }),
      });
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const getCurrentJob = (jobId) => jobs.find((j) => j.id === jobId);

  const toggleSelectAll = () => {
    const visibleIds = sortedJobs.map((j) => j.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedJobs.includes(id));

    if (allSelected) {
      setSelectedJobs((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedJobs((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelectJob = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleDeleteSelected = () => setShowDeleteConfirm(true);

  const confirmDelete = async () => {
    // ✅ Delete from backend
    try {
      await Promise.all(
        selectedJobs.map(jobId =>
          fetch(`http://localhost:8000/api/jobs/${jobId}/`, {
            method: 'DELETE',
          })
        )
      );
    } catch (error) {
      console.error('Error deleting jobs:', error);
    }
    
    // ✅ remove from UI
    setJobs((prev) => prev.filter((job) => !selectedJobs.includes(job.id)));

    // ✅ clear selection + close modal
    setSelectedJobs([]);
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => setShowDeleteConfirm(false);

  const allVisibleSelected =
    sortedJobs.length > 0 && sortedJobs.every((j) => selectedJobs.includes(j.id));


  const getDeadlineStyle = (deadline) => {
    if (!deadline) return {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);

    // Calculate difference in days
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Case 1: Deadline has passed
    if (diffDays < 0) {
      return {
        backgroundColor: '#f8d7da', // Soft red/pink
        color: '#721c24',           // Dark red text
        borderColor: '#f5c6cb',
        fontWeight: 'bold'
      };
    }

    // Case 2: Deadline is approaching (within 7 days)
    if (diffDays <= 7) {
      // Calculate opacity: 0 days = 0.8 opacity, 7 days = 0.1 opacity
      const opacity = 0.8 - (diffDays * 0.1);
      return {
        backgroundColor: `rgba(199, 84, 80, ${opacity})`, // Using your "No Response" red color
        color: diffDays <= 2 ? 'white' : 'inherit',      // White text if it's very red
        borderColor: '#C75450'
      };
    }

    // Case 3: Deadline is far away
    return {};
  };

  return (
    <div className="app-shell">
      <AddJobModal isOpen={open} onClose={() => setOpen(false)} onSave={handleSave} />

      <div className="app-container">
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

          <div className="add-job-container">
            <button className="add-job-btn" onClick={() => setOpen(true)}>
              <Plus size={20} />
              Add New Job
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          {selectedJobs.length > 0 && (
            <div className="action-bar">
              <div className="action-bar-content">
                <span className="selected-count">
                  {selectedJobs.length} selected
                </span>

                <button className="delete-btn" onClick={handleDeleteSelected}>
                  <X size={18} />
                  Delete Selected
                </button>
              </div>
            </div>
          )}

          <div className="table-wrapper">
            <table className="jobs-table">
              <thead>
                <tr>
                  <th style={{ width: "50px" }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={toggleSelectAll}
                      className="select-checkbox"
                    />
                  </th>

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
                  <tr
                    key={job.id}
                    className={selectedJobs.includes(job.id) ? "selected-row" : ""}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => toggleSelectJob(job.id)}
                        className="select-checkbox"
                      />
                    </td>


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
                      onClick={() =>
                        !editingCell && startEdit(job.id, "maxSalary", String(job.maxSalary ?? 0))
                      }
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
                        style={getDeadlineStyle(job.deadline)}
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
      </div>

      {/* Delete confirm */}
      {showDeleteConfirm &&
        createPortal(
          <div
            style={{
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
            }}
            onClick={cancelDelete}
          >
            <div
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                maxWidth: '500px',
                width: '100%',
                padding: '30px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                borderTop: '6px solid #E74C3C'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                <div style={{ fontSize: '64px', marginBottom: '15px' }}>⚠️</div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '24px', color: '#273E47', fontWeight: '700' }}>
                  Delete {selectedJobs.length} Job{selectedJobs.length > 1 ? 's' : ''}?
                </h3>
                <p style={{ color: '#7f8c8d', fontSize: '14px', margin: '10px 0' }}>
                  Are you sure you want to delete the selected job{selectedJobs.length > 1 ? 's' : ''}?
                </p>
                <p style={{ color: '#E74C3C', fontSize: '13px', marginTop: '15px', fontWeight: '600' }}>
                  ⚠️ This action cannot be undone!
                </p>
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={cancelDelete}
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
                  onClick={confirmDelete}
                  style={{
                    flex: 1,
                    padding: '14px',
                    backgroundColor: '#E74C3C',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '15px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 8px rgba(231, 76, 60, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#C0392B';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(231, 76, 60, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#E74C3C';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(231, 76, 60, 0.3)';
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Status Dropdown Portal */}
      {openStatusDropdown &&
        createPortal(
          <>
            <div className="dropdown-overlay" onClick={() => setOpenStatusDropdown(null)} />
            <div
              className="status-dropdown"
              style={{ position: "absolute", top: dropdownPos.top, left: dropdownPos.left }}
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
                          className={currentJob.completedTasks.includes(task) ? "task-completed" : ""}
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
  );
}
