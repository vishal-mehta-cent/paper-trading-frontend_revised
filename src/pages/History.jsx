// frontend/src/pages/History.jsx
import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import { moneyINR } from "../utils/format";
import { NotebookPen } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
          throw new Error(
            `HTTP ${res.status}: ${txt || "Failed to fetch history"}`
          );
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

  const fmtMoney = (n) =>
    n !== null && n !== undefined ? moneyINR(n, { decimals: 2 }) : "—";

  const dateOnly = (dt) => {
    if (!dt || typeof dt !== "string") return "—";
    const [d] = dt.split(" ");
    return d || dt;
  };

  const navigate = useNavigate();
  const goNotes = (s) =>
    navigate(`/notes/${encodeURIComponent((s || "").toUpperCase())}`);

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <BackButton to="/profile" />
      <h2 className="text-2xl font-bold text-center mb-4">History</h2>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-600 whitespace-pre-wrap">
          {error}
        </div>
      ) : history.length === 0 ? (
        <div className="text-center text-gray-500">No history available.</div>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden shadow">
          {/* Header */}
          <div className="grid grid-cols-5 bg-blue-700 text-white font-semibold p-3">
            <div>Time</div>
            <div>Buy Qty</div>
            <div>Buy Details</div>
            <div>P&amp;L</div>
            <div>Sell Details</div>
          </div>

          {history.map((t, idx) => {
            const buyQty = asNum(t.buy_qty) ?? 0;
            const remaining = asNum(t.remaining_qty);
            const isClosedOrPartial =
              t.is_closed || (remaining !== null ? remaining < buyQty : false);
            const rowTone = isClosedOrPartial
              ? "bg-gray-100 text-gray-600"
              : "bg-white";

            const pnlNum = asNum(t.pnl) ?? 0;
            const pnlTone =
              pnlNum > 0
                ? "text-green-600"
                : pnlNum < 0
                ? "text-red-600"
                : "text-gray-800";

            const sellQty = asNum(t.sell_qty) ?? 0;
            const sellAvg = asNum(t.sell_avg_price);
            const investedValue = asNum(t.invested_value);

            const symbolUpper = (t.symbol || "—").toUpperCase();

            return (
              <div
                key={`${t.symbol || "row"}-${t.time || idx}`}
                className={`grid grid-cols-5 items-center p-3 border-t ${rowTone}`}
              >
                {/* Time + Symbol + Notes icon (inline, no new column) */}
                <div className="flex flex-col">
                  <div className="inline-flex items-center gap-2">
                    <span className="font-semibold">{symbolUpper}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goNotes(t.symbol || "");
                      }}
                      title="Notes"
                      className="p-1 rounded hover:bg-gray-100 text-gray-700"
                    >
                      <NotebookPen size={14} />
                    </button>
                  </div>
                  <span className="text-[11px] opacity-60">
                    {t.time || ""}
                  </span>
                </div>

                {/* Buy Qty */}
                <div>{buyQty || "—"}</div>

                {/* Buy Details (date + price) */}
                <div className="text-xs leading-tight">
                  {t.buy_date ? (
                    <>
                      <div>
                        Date:{" "}
                        <span className="font-medium">
                          {dateOnly(t.buy_date)}
                        </span>
                      </div>
                      <div>
                        Price:{" "}
                        <span className="font-medium">
                          {fmtMoney(t.buy_price)}
                        </span>
                      </div>
                    </>
                  ) : (
                    "—"
                  )}
                </div>

                {/* Realized P&L */}
                <div className={`font-medium ${pnlTone}`}>
                  {fmtMoney(pnlNum)}
                </div>

                {/* SELL details */}
                <div className="text-xs leading-tight">
                  {sellQty > 0 ? (
                    <>
                      <div>
                        Date:{" "}
                        <span className="font-medium">
                          {dateOnly(t.sell_date)}
                        </span>
                      </div>
                      <div>
                        Qty: <span className="font-medium">{sellQty}</span>
                      </div>
                      <div>
                        Avg:{" "}
                        <span className="font-medium">
                          {sellAvg !== null ? fmtMoney(sellAvg) : "—"}
                        </span>
                      </div>
                      <div>
                        Invested:{" "}
                        <span className="font-medium">
                          {investedValue !== null
                            ? fmtMoney(investedValue)
                            : "—"}
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
