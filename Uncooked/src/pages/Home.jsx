import { useState } from "react";
import AddJobModal from "../components/AddJobModal";

export default function Home() {
  const [open, setOpen] = useState(false);

  const handleSave = (job) => {
    console.log("Saved job:", job);
    // later: store to Firebase
  };

  return (
    <div>
      <button onClick={() => setOpen(true)}>+ Add Job</button>

      <AddJobModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}
