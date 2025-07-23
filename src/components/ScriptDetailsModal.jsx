import React from "react";

export default function ScriptDetailsModal({ symbol, quote, onClose, onAdd, onBuy, onSell }) {
  if (!symbol) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md md:rounded-xl rounded-t-2xl md:h-auto h-[70%] overflow-auto p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{symbol}</h2>
          <button onClick={onClose} className="text-gray-500">✕</button>
        </div>

        <div className="text-gray-700 text-sm mb-4 space-y-1">
          <div>Price: ₹{quote?.price?.toLocaleString() || "--"}</div>
          <div>Change: {quote?.change?.toFixed(2)} ({quote?.pct_change?.toFixed(2)}%)</div>
          <div>Day's Range: ₹{quote?.low ?? "--"} - ₹{quote?.high ?? "--"}</div>
        </div>

        <div className="flex space-x-3 mb-4">
          <button onClick={onAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg">Add to Watchlist</button>
          <button onClick={onBuy} className="bg-green-600 text-white px-4 py-2 rounded-lg">Buy</button>
          <button onClick={onSell} className="bg-red-600 text-white px-4 py-2 rounded-lg">Sell</button>
        </div>

        <div className="flex flex-wrap gap-3 text-sm">
          <button onClick={() => alert("Coming soon: chart")} className="bg-gray-200 px-3 py-2 rounded-lg">📈 View Chart</button>
          <button onClick={() => alert("Coming soon: alert")} className="bg-gray-200 px-3 py-2 rounded-lg">🔔 Set Alert</button>
          <button onClick={() => alert("Coming soon: notes")} className="bg-gray-200 px-3 py-2 rounded-lg">📝 Add Notes</button>
        </div>
      </div>
    </div>
  );
}
 