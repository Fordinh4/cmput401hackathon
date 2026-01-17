function AddJobForm({ onClose }) {
  return (
    <div className="modal">
      <h2>Add Job</h2>

      <input placeholder="Job Title" />
      <input placeholder="Company" />
      <input placeholder="Job URL" />
      <textarea placeholder="Job Description" />

      <input type="number" placeholder="Max Salary" />
      <input placeholder="Location" />

      <select>
        <option>Applied</option>
        <option>Interview</option>
        <option>Offer</option>
      </select>

      <input type="date" />
      <input type="date" />

      <select>
        <option>1</option>
        <option>2</option>
        <option>3</option>
        <option>4</option>
        <option>5</option>
      </select>

      <button>Save Job</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  )
}

export default AddJobForm
