// frontend/src/pages/Orders.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Search, Briefcase, User, X } from "lucide-react";
import BackButton from "../components/BackButton";

const API = "http://localhost:8000"; // keep consistent with your backend

// ---------- Safe helpers ----------
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const money = (v) => {
  const n = toNum(v);
  return n === null ? "—" : `₹${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
const intval = (v) => {
  const n = toNum(v);
  return n === null ? "—" : n;
};
const pct = (v) => {
  const n = toNum(v);
  return n === null ? "—" : `${n.toFixed(2)}%`;
};
const timeOnly = (dt) => {
  if (!dt || typeof dt !== "string") return "";
  const parts = dt.split(" ");
  return parts[1] || dt;
};

// Small pill for SL/Target/etc.
const Chip = ({ label, value, tone = "gray" }) => {
  const toneClass =
    tone === "red"
      ? "bg-red-50 text-red-700 border-red-200"
      : tone === "green"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span className={`inline-flex items-center text-xs px-2 py-1 rounded-full border ${toneClass}`}>
      <span className="opacity-70 mr-1">{label}:</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
};

export default function Orders({ username }) {
  const [openOrders, setOpenOrders] = useState([]);
  const [positions, setPositions] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [tab, setTab] = useState("open");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const intervalRef = useRef(null);
  const nav = useNavigate();

  // Fetch open orders + positions
  useEffect(() => {
    if (!username) {
      setErrorMsg("Username is missing.");
      setLoading(false);
      return;
    }

    Promise.all([
      fetch(`${API}/orders/${username}`),
      fetch(`${API}/orders/positions/${username}`),
    ])
      .then(async ([openRes, posRes]) => {
        if (!openRes.ok || !posRes.ok) throw new Error("Fetch failed");

        const openData = await openRes.json();
        const posData = await posRes.json();

        // Normalize numbers so render never sees strings/nulls
        const norm = (arr) =>
          Array.isArray(arr)
            ? arr.map((o) => ({
                ...o,
                price: toNum(o?.price) ?? null,
                live_price: toNum(o?.live_price),
                trigger_price: toNum(o?.trigger_price),
                qty: toNum(o?.qty) ?? 0,
                pnl: toNum(o?.pnl),
                stoploss: toNum(o?.stoploss),
                target: toNum(o?.target),
              }))
            : [];

        setOpenOrders(norm(openData));
        setPositions(norm(posData));
        setErrorMsg("");
      })
      .catch((err) => {
        console.error(err);
        setErrorMsg("No Order");
      })
      .finally(() => setLoading(false));
  }, [username]);

  // Live quotes
  useEffect(() => {
    const allSymbols = [...openOrders, ...positions]
      .map((o) => o.script || o.symbol)
      .filter(Boolean);

    if (!allSymbols.length) return;

    const fetchQuotes = () => {
      fetch(`${API}/quotes?symbols=${allSymbols.join(",")}`)
        .then((r) => r.json())
        .then((arr) => {
          const map = {};
          (arr || []).forEach((q) => {
            const sym = q?.symbol;
            if (!sym) return;
            map[sym] = {
              price: toNum(q?.price),
              change: toNum(q?.change),
              pct_change: toNum(q?.pct_change),
              open: toNum(q?.open),
            };
          });
          setQuotes(map);
        })
        .catch(() => {});
    };

    fetchQuotes();
    intervalRef.current = setInterval(fetchQuotes, 2000);
    return () => clearInterval(intervalRef.current);
  }, [openOrders, positions]);

  const ordersToShow = tab === "open" ? openOrders : positions;

  const totalPnl = positions.reduce((sum, o) => {
    const script = o.script || o.symbol;
    const q = (script && quotes[script]) || {};
    const entry = toNum(o.price) ?? 0;
    const live = toNum(q.price) ?? toNum(o.live_price) ?? entry;
    const qty = toNum(o.qty) ?? 0;
    const side = (o.type || o.order_type) === "SELL" ? -1 : 1;
    const pnl = (live - entry) * qty * side;
    return sum + (Number.isFinite(pnl) ? pnl : 0);
  }, 0);

  // Action handlers
  const handleAdd = async () => {
    if (!selectedOrder) return;
    await fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        script: selectedOrder.script || selectedOrder.symbol,
        order_type: "BUY",
        qty: selectedOrder.qty,
        price: selectedOrder.price,
      }),
    });
    setShowActions(false);
  };

  const handleExit = async () => {
    if (!selectedOrder) return;
    await fetch(`${API}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        script: selectedOrder.script || selectedOrder.symbol,
        order_type: "SELL",
        qty: selectedOrder.qty,
        price: selectedOrder.price,
      }),
    });
    setShowActions(false);
  };

  const handleModify = async () => {
    if (!selectedOrder) return;
    const newQty = prompt("Enter new quantity", selectedOrder.qty);
    const newPrice = prompt("Enter new price", selectedOrder.price ?? selectedOrder.trigger_price);
    if (!newQty || !newPrice) return;

    // ✅ match backend route: PUT /orders/modify/{order_id}
    await fetch(`${API}/orders/modify/${selectedOrder.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        qty: parseInt(newQty, 10),
        price: parseFloat(newPrice),
      }),
    });
    setShowActions(false);
  };

  const handleCancel = async () => {
    if (!selectedOrder) return;
    // ✅ match backend route: DELETE /orders/cancel/{order_id}
    await fetch(`${API}/orders/cancel/${selectedOrder.id}`, {
      method: "DELETE",
    });
    setShowActions(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      <BackButton to="/menu" />
      <div className="p-4">
        <h2 className="text-2xl font-bold text-center text-gray-700 dark:text-white mb-4">
          Orders
        </h2>

        <div className="flex justify-center mb-4 space-x-6">
          {["open", "positions"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-1 text-sm font-medium ${
                tab === t
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 dark:text-gray-300"
              }`}
            >
              {t === "open" ? "Open Trades" : "Positions"}
            </button>
          ))}
        </div>

        {tab === "positions" && (
          <div className="mb-4 text-center">
            <div className="inline-block px-4 py-2 bg-white dark:bg-gray-800 rounded-xl shadow text-xl font-semibold">
              Total P&L:{" "}
              <span className={totalPnl >= 0 ? "text-green-600" : "text-red-500"}>
                {money(totalPnl)}
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : errorMsg ? (
          <div className="text-center text-red-500 dark:text-red-400">{errorMsg}</div>
        ) : ordersToShow.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-10">
            No {tab} items.
          </div>
        ) : (
          <div className="space-y-3">
            {ordersToShow.map((o, i) => {
              const script = o.script || o.symbol || "N/A";
              const q = quotes[script] || {};
              const live = toNum(q.price) ?? toNum(o.live_price) ?? toNum(o.price) ?? 0;
              const change = toNum(q.change) ?? 0;
              const pctChange = toNum(q.pct_change) ?? 0;

              // Entry/Order price:
              // - Open tab: show the "trigger_price" (user order price)
              // - Positions tab: show the executed "price" (entry)
              const entryPrice =
                tab === "open"
                  ? toNum(o.trigger_price) ?? toNum(o.price) ?? 0
                  : toNum(o.price) ?? 0;

              const isBuy = (o.type || o.order_type) === "BUY";
              const executed = tab === "open" ? 0 : toNum(o.qty) ?? 0;

              // ✅ Grey & disable cancelled/expired rows
              const statusStr = String(o.status || "").toLowerCase();
              const statusMsgStr = String(o.status_msg || "").toLowerCase();
              const isCancelled =
                statusStr === "cancelled" ||
                statusMsgStr.includes("cancelled") ||
                statusMsgStr.includes("expired");

              // show SL/Target if present
              const sl = toNum(o.stoploss);
              const tgt = toNum(o.target);

              return (
                <div
                  key={i}
                  onClick={() => {
                    if (isCancelled) return; // disable click
                    setSelectedOrder(o);
                    setShowActions(true);
                  }}
                  className={`p-4 rounded-xl shadow flex flex-col gap-2 hover:shadow-md ${
                    isCancelled
                      ? "bg-gray-100 text-gray-500 pointer-events-none"
                      : "bg-white dark:bg-gray-800 cursor-pointer"
                  }`}
                >
                  <div className="flex justify-between text-sm">
                    <span className={`${isBuy ? "text-green-600" : "text-red-600"} font-semibold`}>
                      {isBuy ? "BUY" : "SELL"} • {executed}/{intval(o.qty)} Qty
                    </span>
                    {o.datetime && (
                      <span className="text-gray-500 dark:text-gray-300">
                        {timeOnly(o.datetime)}
                      </span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="text-xl font-bold text-gray-800 dark:text-white">
                      {script}
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-200">
                      {money(entryPrice)}
                    </div>
                  </div>

                  {/* NEW: Info chips row (Order/Entry price, Qty, SL, Target) */}
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Chip
                      label={tab === "open" ? "Order Price" : "Entry Price"}
                      value={money(entryPrice)}
                    />
                    <Chip label="Qty" value={intval(o.qty)} />
                    {sl !== null && <Chip label="SL" value={money(sl)} tone="red" />}
                    {tgt !== null && <Chip label="Target" value={money(tgt)} tone="green" />}
                  </div>

                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-gray-500 dark:text-gray-400">
                      NSE | Total Investment={money((entryPrice || 0) * (toNum(o.qty) ?? 0))}
                    </span>
                    <span className={`${(change ?? 0) < 0 ? "text-red-500" : "text-green-500"}`}>
                      {money(live)} {(change ?? 0) < 0 ? "↓" : "↑"} ({pct(pctChange)})
                    </span>
                  </div>

                  {/* Optional: show status message from backend */}
                  {o.status_msg && (
                    <div className="text-[11px] text-gray-500 mt-1">{o.status_msg}</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Popup Action Modal */}
      {showActions && selectedOrder && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-80 shadow-lg transform transition-all duration-300 scale-100">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                {selectedOrder.script || selectedOrder.symbol}
              </h3>
              <X
                size={20}
                className="cursor-pointer text-gray-500 hover:text-red-500"
                onClick={() => setShowActions(false)}
              />
            </div>

            {/* Live Data */}
            <div className="text-center mb-4">
              {(() => {
                const sym = selectedOrder.script || selectedOrder.symbol;
                const q = (sym && quotes[sym]) || {};
                const live = toNum(q.price) ?? toNum(selectedOrder.price) ?? 0;
                const chg = toNum(q.change);
                const pctc = toNum(q.pct_change);

                return (
                  <>
                    <div className="text-2xl font-bold">{money(live)}</div>
                    <div className={(chg ?? 0) >= 0 ? "text-green-500" : "text-red-500"}>
                      {(chg ?? 0) >= 0 ? "+" : ""}
                      {chg === null ? "—" : chg.toFixed(2)} (
                      {pctc === null ? "—" : `${pctc.toFixed(2)}%`})
                    </div>
                  </>
                );
              })()}
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleModify}
                className="bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg"
              >
                Modify
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Icons */}
      <div className="absolute right-5 top-10 flex items-center space-x-4 z-50">
        <div className="flex flex-col items-center cursor-pointer" onClick={() => nav("/portfolio")}>
          <Briefcase size={22} className="text-gray-600 dark:text-white hover:text-blue-600" />
          <span className="text-xs text-gray-500 dark:text-white">Portfolio</span>
        </div>
        <div className="flex flex-col items-center cursor-pointer" onClick={() => nav("/profile")}>
          <User size={22} className="text-gray-600 dark:text-white hover:text-blue-600" />
          <span className="text-xs text-gray-500 dark:text-white">Profile</span>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 p-2 flex justify-around z-40 border-t border-gray-700">
        <button onClick={() => nav("/trade")} className="flex flex-col items-center text-gray-400">
          <Search size={22} />
          <span className="text-xs">Watchlist</span>
        </button>
        <button className="flex flex-col items-center text-blue-400">
          <ClipboardList size={22} />
          <span className="text-xs">Orders</span>
        </button>
      </div>
    </div>
  );
}
