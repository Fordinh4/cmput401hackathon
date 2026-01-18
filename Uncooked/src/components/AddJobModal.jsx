import { useMemo, useState, useEffect } from "react";
import "./AddJobModal.css";

const STATUS_OPTIONS = [
  "Applying",
  "Applied",
  "Interviewing",
  "Negotiating",
  "Accepted",
  "No Response",
];

export default function AddJobModal({ isOpen, onClose, onSave }) {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const initialForm = useMemo(
    () => ({
      title: "",
      url: "",
      company: "",
      location: "",
      description: "",
      maxSalary: "",
      status: "Applying",
      deadline: "",
      dateApplied: today,
      followUp: "",
    }),
    [today]
  );

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!isOpen) setForm(initialForm);
  }, [isOpen, initialForm]);

  if (!isOpen) return null;

  const setField = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave?.({
      ...form,
      maxSalary: form.maxSalary ? Number(form.maxSalary) : 0,
      deadline: form.deadline || null,
      followUp: form.followUp || null,
    });

    onClose?.();
    setForm(initialForm);
  };

  const handleClose = () => {
    onClose?.();
    setForm(initialForm);
  };

  return (
    <div className="ajm-overlay" onClick={handleClose}>
      <div className="ajm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ajm-header">
          <h2 className="ajm-title">Add a Job</h2>
          <button className="ajm-close" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form className="ajm-form" onSubmit={handleSubmit}>
          <div className="ajm-grid">
            <label className="ajm-field">
              <span>Title</span>
              <input value={form.title} onChange={setField("title")} required />
            </label>

            <label className="ajm-field">
              <span>Company</span>
              <input value={form.company} onChange={setField("company")} required />
            </label>

            <label className="ajm-field">
              <span>Location</span>
              <input value={form.location} onChange={setField("location")} />
            </label>

            <label className="ajm-field">
              <span>Max Salary</span>
              <input
                type="number"
                value={form.maxSalary}
                onChange={setField("maxSalary")}
                min="0"
              />
            </label>

            <label className="ajm-field">
              <span>Status</span>
              <select value={form.status} onChange={setField("status")}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            <label className="ajm-field">
              <span>Date Applied</span>
              <input type="date" value={form.dateApplied} onChange={setField("dateApplied")} />
            </label>

            <label className="ajm-field">
              <span>Deadline</span>
              <input type="date" value={form.deadline || ""} onChange={setField("deadline")} />
            </label>

            <label className="ajm-field">
              <span>Follow Up</span>
              <input type="date" value={form.followUp || ""} onChange={setField("followUp")} />
            </label>

            <label className="ajm-field ajm-span2">
              <span>URL</span>
              <input value={form.url} onChange={setField("url")} placeholder="https://..." />
            </label>

            <label className="ajm-field ajm-span2">
              <span>Description</span>
              <textarea value={form.description} onChange={setField("description")} rows={4} />
            </label>
          </div>

          <div className="ajm-actions">
            <button type="button" className="ajm-btn ajm-btn-ghost" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="ajm-btn ajm-btn-primary">
              Save Job
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
