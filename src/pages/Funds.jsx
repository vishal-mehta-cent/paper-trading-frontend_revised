import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

export default function Funds({ username }) {
  const [totalFunds, setTotalFunds] = useState(0);
  const [availableFunds, setAvailableFunds] = useState(0);
  const [newAmount, setNewAmount] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Fetch funds
  const fetchFunds = () => {
  if (!username) return;

  setLoading(true);
  setMessage(""); // Clear message initially

  fetch(`http://127.0.0.1:8000/funds/available/${encodeURIComponent(username)}`)
    .then((res) => {
      if (!res.ok) {
        if (res.status === 404) {
          // New user, no fund record yet – not an error
          setTotalFunds(0);
          setAvailableFunds(0);
          return null;
        }
        throw new Error("Server error");
      }
      return res.json();
    })
    .then((data) => {
      if (data) {
        setTotalFunds(data.total_funds || 0);
        setAvailableFunds(data.available_funds || 0);
      }
    })
    .catch((err) => {
      console.error("Error loading funds:", err);
      setMessage("❌ Failed to load fund details");
    })
    .finally(() => setLoading(false));
};

  useEffect(() => {
    fetchFunds();
  }, [username]);

  const handleUpdate = async () => {
  const amount = parseFloat(newAmount);

  if (!newAmount || isNaN(amount) || amount <= 0) {
    setMessage("❌ Please enter a valid positive number");
    return;
  }

  setMessage("Updating funds...");

  try {
    const res = await fetch(`http://127.0.0.1:8000/funds/${encodeURIComponent(username)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),  // ✅ No username, just amount
    });

    if (!res.ok) throw new Error("Failed to update funds");

    await res.json();
    fetchFunds();
    setNewAmount("");
    setMessage("✅ Funds updated successfully");
  } catch (err) {
    console.error("Update error:", err);
    setMessage("❌ Something went wrong while updating funds");
  }
};


  return (
    <div className="min-h-screen p-6 bg-white">
      <BackButton to="/profile" />
      <h2 className="text-xl font-bold text-blue-600 text-center mb-4">💰 Manage Funds</h2>

      {message && (
        <div
          className={`text-center mb-4 font-medium p-2 rounded ${
            message.startsWith("✅")
              ? "bg-green-100 text-green-700"
              : message.startsWith("Updating")
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded shadow text-center mb-6 border border-blue-100">
        <p className="text-gray-600 text-sm">Total Funds</p>
        <p className="text-xl font-bold text-blue-800 mb-2">
          ₹{totalFunds.toFixed(2)}
        </p>
        <p className="text-gray-600 text-sm">Available Funds</p>
        <p className="text-xl font-semibold text-green-600">
          ₹{availableFunds.toFixed(2)}
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <input
          type="number"
          min="0"
          value={newAmount}
          onChange={(e) => setNewAmount(e.target.value)}
          className="w-full border px-4 py-2 rounded text-lg"
          placeholder="Enter Amount To Add"
        />
        <button
          onClick={handleUpdate}
          className="w-full bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700"
        >
          {loading ? "Please wait..." : "Add Funds"}
        </button>
      </div>
    </div>
  );
}
