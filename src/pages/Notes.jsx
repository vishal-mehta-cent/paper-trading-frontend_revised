// ✅ Notes.jsx - Notes Page for a Script
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Notes() {
  const { symbol } = useParams();
  const [note, setNote] = useState("");
  const navigate = useNavigate();

  const handleSave = () => {
    alert(`Note saved for ${symbol}`);
    setTimeout(() => navigate("/trade"), 2000);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col p-4">
      <h1 className="text-xl font-semibold mb-4">Your Notes for {symbol}</h1>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={10}
        className="border p-2 rounded w-full mb-4"
        placeholder="Write your notes here..."
      />
      <button
        onClick={handleSave}
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        Save Note
      </button>
    </div>
  );
}
