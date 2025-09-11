import React from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function ScriptDetailsModal({
  symbol,
  quote,
  onClose,
  onAdd,
  onBuy,
  onSell,
}) {
  // if closed, render nothing
  if (!symbol) return null;

  const navigate = useNavigate();
  const sym = (symbol || quote?.symbol || "").toString().toUpperCase();
  const loc = useLocation();

  const handleAddNotes = () => {
    // If your route is /notes (without :symbol), change to:
    // navigate("/notes", { state: { symbol: sym } })
    navigate(`/notes/${sym}`, { state: { symbol: sym } });
  };

  // Render inside a portal with a stable key to silence the React warning
  const target = typeof document !== "undefined" ? document.body : null;
  const body = (
    <div
      key={sym} /* ← stable key fixes "Expected static flag" warning */
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div className="bg-white w-full max-w-md md:rounded-xl rounded-t-2xl md:h-auto h-[70%] overflow-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{sym}</h2>
          <button onClick={onClose} className="text-gray-500">
            ✕
          </button>
        </div>

        <div className="text-gray-700 text-sm mb-4 space-y-1">
          <div>
            Price: ₹
            {quote?.price != null
              ? Number(quote.price).toLocaleString("en-IN")
              : "--"}
          </div>
          <div>
            Change:{" "}
            {Number.isFinite(quote?.change) ? quote.change.toFixed(2) : "--"} (
            {Number.isFinite(quote?.pct_change) ? quote.pct_change.toFixed(2) : "--"}
            %)
          </div>
          <div>
            Day&apos;s Range: ₹{quote?.dayLow ?? "--"} - ₹{quote?.dayHigh ?? "--"}
          </div>
        </div>

        <div className="flex space-x-3 mb-4">
          <button
            onClick={onAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Add to Watchlist
          </button>
          <button
            onClick={onBuy}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Buy
          </button>
          <button
            onClick={onSell}
            className="bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Sell
          </button>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <button
            onClick={() => alert("Coming soon: chart")}
            className="bg-gray-200 px-3 py-2 rounded-lg"
          >
            📈 View Chart
          </button>
          <button
            onClick={() => alert("Coming soon: alert")}
            className="bg-gray-200 px-3 py-2 rounded-lg"
          >
            🔔 Set Alert
          </button>
          <button
            onClick={handleAddNotes}
            className="bg-gray-200 px-3 py-2 rounded-lg"
          >
            📝 Add Notes
          </button>
        </div>
      </div>
    </div>
  );

  return target ? createPortal(body, target) : body;
}
