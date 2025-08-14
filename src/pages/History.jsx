// frontend/src/pages/History.jsx
import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

const API = "http://127.0.0.1:8000";

export default function History({ username }) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) {
      setError("Username missing");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const url = `${API}/orders/history/${username}`;
    console.log("Fetching:", url);

    fetch(url)
      .then(async (res) => {
        console.log("Response status:", res.status);
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(`HTTP ${res.status}: ${txt || "Failed to fetch history"}`);
        }
        return res.json();
      })
      .then((data) => {
        console.log("History payload:", data);
        setHistory(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("History fetch error:", err);
        setError(err.message || "Failed to load history");
      })
      .finally(() => setLoading(false));
  }, [username]);

  // -------- formatters (safe) --------
  const asNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const money = (v) => {
    const n = asNum(v);
    return n === null ? "—" : `₹${n.toFixed(2)}`;
  };
  const dateOnly = (dt) => {
    if (!dt || typeof dt !== "string") return "—";
    const [d] = dt.split(" ");
    return d || dt;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <BackButton to="/menu" />
      <h2 className="text-2xl font-bold text-center mb-4">History</h2>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600 whitespace-pre-wrap">{error}</div>
      ) : history.length === 0 ? (
        <div className="text-center text-gray-500">No history available.</div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden shadow">
          {/* Header: 5 cols now */}
          <div className="grid grid-cols-5 bg-blue-700 text-white font-semibold p-3">
            <div>Time</div>
            <div>Buy Qty</div>
            <div>Buy Price</div>
            <div>P&amp;L</div>
            <div>SELL</div>
          </div>

          {history.map((t, idx) => {
            const buyQty = asNum(t.buy_qty) ?? 0;
            const remaining = asNum(t.remaining_qty);
            const isClosedOrPartial =
              t.is_closed || (remaining !== null ? remaining < buyQty : false);
            const rowTone = isClosedOrPartial ? "bg-gray-100 text-gray-600" : "bg-white";
            const pnlNum = asNum(t.pnl) ?? 0;
            const pnlTone =
              pnlNum > 0 ? "text-green-600" : pnlNum < 0 ? "text-red-600" : "text-gray-800";

            // SELL data (from backend FIFO aggregation)
            const sellQty = asNum(t.sell_qty) ?? 0;
            const sellAvg = asNum(t.sell_avg_price);
            const investedValue = asNum(t.invested_value);

            return (
              <div
                key={`${t.symbol || "row"}-${t.time || idx}`}
                className={`grid grid-cols-5 items-center p-3 border-t ${rowTone}`}
              >
                {/* Time + Symbol */}
                <div className="flex flex-col">
                  <span className="font-semibold">{t.symbol || "—"}</span>
                  <span className="text-[11px] opacity-60">{t.time || ""}</span>
                </div>

                {/* Buy Qty */}
                <div>{buyQty || "—"}</div>

                {/* Buy Price */}
                <div>{money(t.buy_price)}</div>

                {/* Realized P&L on sold portion of this lot */}
                <div className={`font-medium ${pnlTone}`}>{money(pnlNum)}</div>

                {/* SELL column */}
                <div className="text-xs leading-tight">
                  {sellQty > 0 ? (
                    <>
                      <div>
                        Date: <span className="font-medium">{dateOnly(t.sell_date)}</span>
                      </div>
                      <div>
                        Qty: <span className="font-medium">{sellQty}</span>
                      </div>
                      <div>
                        Avg:{" "}
                        <span className="font-medium">
                          {sellAvg !== null ? money(sellAvg) : "—"}
                        </span>
                      </div>
                      <div>
                        Invested:{" "}
                        <span className="font-medium">
                          {investedValue !== null ? money(investedValue) : "—"}
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
