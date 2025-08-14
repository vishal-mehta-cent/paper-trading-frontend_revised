import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

export default function Portfolio({ username }) {
  const [data, setData] = useState({ open: [], closed: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/portfolio/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch portfolio");
        return res.json();
      })
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((err) => {
        console.error("Portfolio error:", err);
        setError("Something went wrong. Please try again.");
        setData({ open: [], closed: [] });
      });
  }, [username]);

  if (error) {
    return <div className="p-4 text-center text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <BackButton to="/menu" />
      <h2 className="text-xl font-bold text-blue-600 text-center mb-4">Portfolio</h2>

      {/* ✅ Open Positions */}
      <h3 className="text-lg font-semibold mt-6 mb-2">Open Positions</h3>
      {data.open.length === 0 ? (
        <div className="text-sm text-gray-500">No open positions.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Script</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Avg Price</th>
                <th className="p-2">Current Price</th>
                <th className="p-2">P&L</th>
              </tr>
            </thead>
            <tbody>
              {data.open.map((p, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-medium">{p.symbol}</td>
                  <td className="p-2">{p.qty}</td>
                  <td className="p-2">₹{p.avg_price.toFixed(2)}</td>
                  <td className="p-2">₹{p.current_price.toFixed(2)}</td>
                  <td className={`p-2 font-semibold ${p.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
                    ₹{p.pnl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
