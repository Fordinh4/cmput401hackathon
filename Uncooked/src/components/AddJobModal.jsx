import { useMemo, useState } from "react";
import "./AddJobModal.css";

const STATUS_OPTIONS = [
  "Not applied",
  "Applied",
  "Viewed",
  "Interviewing",
  "Offer",
  "Hired",
  "Rejected",
];

export default function AddJobModal({ isOpen, onClose, onSave }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [form, setForm] = useState({
    title: "",
    url: "",
    company: "",
    location: "",
    description: "",
    maxSalary: "",
    status: "Not applied",
    deadline: "",
    dateApplied: today,
  });

  if (!isOpen) return null;

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    // basic "required" check, keep it simple
    if (!form.title.trim() || !form.company.trim()) return;

    const payload = {
      ...form,
      maxSalary: form.maxSalary === "" ? null : Number(form.maxSalary),
      createdAt: new Date().toISOString(),
    };

    onSave?.(payload);
    onClose?.();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div className="modal-backdrop" onMouseDown={handleBackdropClick}>
      <div className="modal" role="dialog" aria-modal="true">

        <h1 className="modal-title">Add a New Job Post</h1>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label className="label">Job Title *</label>
            <input
              className="input"
              placeholder="e.g., Software Engineer Intern"
              value={form.title}
              onChange={setField("title")}
              required
            />
          </div>

          <div className="field">
            <label className="label">URL for Original Posting</label>
            <input
              className="input"
              placeholder="https://..."
              value={form.url}
              onChange={setField("url")}
              type="url"
            />
          </div>

          <div className="field">
            <label className="label">Company Name *</label>
            <input
              className="input"
              placeholder="e.g., Microsoft"
              value={form.company}
              onChange={setField("company")}
              required
            />
          </div>

          <div className="two-col">
            <div className="field">
              <label className="label">Location</label>
              <input
                className="input"
                placeholder="e.g., Edmonton / Remote"
                value={form.location}
                onChange={setField("location")}
              />
            </div>

            <div className="field">
              <label className="label">Max Salary</label>
              <input
                className="input"
                placeholder="e.g., 85000"
                value={form.maxSalary}
                onChange={setField("maxSalary")}
                type="number"
                min="0"
                step="0.01"
              />
            </div>
          </div>

        <div className="field">
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={setField("status")}>
                {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                    {s}
                </option>
                ))}
            </select>
        </div>


        <div className="two-col">
            <div className="field">
                <label className="label">Deadline</label>
                <input
                    className="input date-button"
                    type="date"
                    value={form.deadline}
                    onChange={setField("deadline")}
                    onKeyDown={(e) => e.preventDefault()}  // blocks typing
                    onPaste={(e) => e.preventDefault()}   // blocks paste
                    onClick={(e) => e.currentTarget.showPicker?.()} // opens on click
                    onFocus={(e) => e.currentTarget.showPicker?.()} // opens on focus
                    inputMode="none"
                />

            </div>

            <div className="field">
                <label className="label">Date Applied</label>
                <input
                    className="input date-button"
                    type="date"
                    value={form.dateApplied}
                    onChange={setField("dateApplied")}
                    onKeyDown={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    onClick={(e) => e.currentTarget.showPicker?.()}
                    onFocus={(e) => e.currentTarget.showPicker?.()}
                    inputMode="none"
                />


            </div>
        </div>


          <div className="field">
            <label className="label">Job Description</label>
            <textarea
              className="textarea"
              placeholder="Paste the job description here..."
              value={form.description}
              onChange={setField("description")}
              rows={8}
            />
          </div>

          <div className="actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
