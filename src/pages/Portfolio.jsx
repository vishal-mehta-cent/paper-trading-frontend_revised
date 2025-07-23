import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

export default function Portfolio({ username }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/portfolio/${username}`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => {
        console.error("Portfolio error:", err);
        setData({ open: [], closed: [] });
      });
  }, [username]);

  if (!data) return <div className="p-4 text-center text-gray-500">Loading page...</div>;

  return (
    <div className="p-4">
      <BackButton to="/menu" />
      <h2 className="text-xl font-bold text-blue-600 text-center mb-4">Portfolio</h2>

      <h3 className="text-lg font-semibold mt-6 mb-2">Open Positions</h3>
      {data.open.length === 0 ? (
        <div className="text-sm text-gray-500">No open positions.</div>
      ) : (
        data.open.map((p, i) => (
          <div key={i} className="border p-3 rounded mb-2 shadow bg-white">
            <div className="font-semibold">{p.symbol}</div>
            <div className="text-sm text-gray-600">
              Qty: {p.qty} | Avg: ₹{p.avg_price} | Current: ₹{p.current_price}
            </div>
            <div className={`text-sm font-bold ${p.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
              P&L: ₹{p.pnl}
            </div>
          </div>
        ))
      )}

      <h3 className="text-lg font-semibold mt-6 mb-2">Closed Trades</h3>
      {data.closed.length === 0 ? (
        <div className="text-sm text-gray-500">No closed trades yet.</div>
      ) : (
        data.closed.map((t, i) => (
          <div key={i} className="border p-3 rounded mb-2 shadow bg-white">
            <div className="font-semibold">{t.symbol}</div>
            <div className="text-sm text-gray-600">
              {t.order_type} • Qty: {t.qty} • ₹{t.price} • {t.datetime}
            </div>
            <div className={`text-sm font-bold ${t.pnl >= 0 ? "text-green-600" : "text-red-600"}`}>
              P&L: ₹{t.pnl}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
