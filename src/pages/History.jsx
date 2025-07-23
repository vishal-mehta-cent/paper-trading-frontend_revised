import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

export default function History({ username }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/orders/history/${username}`)
      .then(res => res.json())
      .then(setHistory)
      .catch(() => setHistory([]));
  }, [username]);

  return (
    <div className="min-h-screen bg-white p-4 relative">
      <BackButton to="/profile" />
      <h2 className="text-xl font-bold text-center text-blue-600 mb-4">
        🧾 History
      </h2>

      {history.length === 0 ? (
        <p className="text-center text-gray-500">No trades yet.</p>
      ) : (
        <div className="space-y-3">
          {history.map((item, index) => (
            <div
              key={index}
              className="p-3 rounded-lg shadow border flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{item.script}</div>
                <div className="text-xs text-gray-500">
                  {item.datetime}
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${item.type === "BUY" ? "text-green-600" : "text-red-600"}`}>
                  {item.type} ₹{item.price} × {item.qty}
                </div>
                <div className="text-xs text-gray-500">P&L: ₹{item.pnl.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
