// frontend/src/pages/Portfolio.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import BackButton from "../components/BackButton";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, NotebookPen } from "lucide-react";

// ---------- formatting helpers ----------
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
const money = (v) => {
  const n = toNum(v);
  return n === null
    ? "₹0.00"
    : `₹${n.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
};
const pctText = (v) => {
  const n = toNum(v);
  return n === null ? "0.00%" : `${n.toFixed(2)}%`;
};
const signed = (n, d = 2) => `${n >= 0 ? "+" : ""}${n.toFixed(d)}`;

// small pill (same look as Positions)
const Chip = ({ label, value, tone = "gray" }) => {
  const toneClass =
    tone === "red"
      ? "bg-red-50 text-red-700 border-red-200"
      : tone === "green"
      ? "bg-green-50 text-green-700 border-green-200"
      : "bg-gray-50 text-gray-700 border-gray-200";
  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-1 rounded-full border ${toneClass}`}
    >
      <span className="opacity-70 mr-1">{label}:</span>
      <span className="font-semibold">{value}</span>
    </span>
  );
};

const SegmentBadge = ({ segment }) => {
  const seg = (segment || "delivery").toLowerCase();
  const isIntra = seg === "intraday";
  return (
    <span
      className={`inline-flex items-center px-2 py-[2px] rounded-full text-[11px] border ${
        isIntra
          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
          : "bg-amber-50 text-amber-700 border-amber-200"
      }`}
      title="Segment"
    >
      {isIntra ? "intraday" : "delivery"}
    </span>
  );
};

const handleNote = (symbol) =>
  navigate(`/notes/${encodeURIComponent(symbol)}`);

export default function Portfolio({ username }) {
  const [data, setData] = useState({ open: [], closed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [quotes, setQuotes] = useState({});
  const pollRef = useRef(null);
  const navigate = useNavigate();

  // ------- load portfolio -------
  const load = () => {
    setLoading(true);
    setError("");
    const ctrl = new AbortController();

    fetch(`http://127.0.0.1:8000/portfolio/${encodeURIComponent(username)}`, {
      signal: ctrl.signal,
    })
      .then(async (res) => {
        if (!res.ok) {
          let detail = "";
          try {
            const j = await res.json();
            detail = j?.detail || "";
          } catch {}
          throw new Error(
            detail || `Failed to fetch portfolio (HTTP ${res.status})`
          );
        }
        return res.json();
      })
      .then((result) => {
        setData({
          open: Array.isArray(result?.open) ? result.open : [],
          closed: Array.isArray(result?.closed) ? result.closed : [],
        });
        setError("");
      })
      .catch((err) => {
        if (
          err?.name === "AbortError" ||
          err?.message?.toLowerCase().includes("aborted")
        )
          return;
        console.error("Portfolio fetch error:", err);
        setError(err.message || "Something went wrong. Please try again.");
        setData({ open: [], closed: [] });
      })
      .finally(() => setLoading(false));

    return () => ctrl.abort();
  };

  useEffect(load, [username]);

  // ------- poll quotes for all open holdings -------
  useEffect(() => {
    if (!data.open.length) return;

    const syms = [
      ...new Set(
        data.open.map((p) => (p.symbol || p.script || "").toUpperCase())
      ),
    ].filter(Boolean);
    if (!syms.length) return;

    const fetchQuotes = () => {
      fetch(`http://127.0.0.1:8000/quotes?symbols=${syms.join(",")}`)
        .then((r) => r.json())
        .then((arr) => {
          const qmap = {};
          (arr || []).forEach((q) => {
            const sym = (q?.symbol || q?.Script || "").toUpperCase();
            if (!sym) return;
            qmap[sym] = {
              price: toNum(q.price),
              change: toNum(q.change),
              pct_change: toNum(q.pct_change),
            };
          });
          setQuotes(qmap);
        })
        .catch(() => {});
    };

    // initial + poll
    fetchQuotes();
    pollRef.current = setInterval(fetchQuotes, 2000);
    return () => clearInterval(pollRef.current);
  }, [data.open]);

  // ------- handlers -------
  const handleAdd = (symbol) => navigate(`/buy/${symbol}`);
  const handleExit = (symbol) => navigate(`/sell/${symbol}`);
  const handleCloseModal = () => setSelected(null);
  const handleNote = (symbol) =>
    navigate(`/notes/${encodeURIComponent((symbol || "").toUpperCase())}`); // <— go to notes page

  // totals (optional display)
  const totalInvested = useMemo(
    () =>
      data.open.reduce(
        (s, p) => s + (toNum(p.avg_price) ?? 0) * (toNum(p.qty) ?? 0),
        0
      ),
    [data.open]
  );

  return (
    <div className="p-4">
      <BackButton to="/menu" />
      <h2 className="text-center text-xl font-bold text-blue-600">Portfolio</h2>

      {loading && <div className="text-center text-gray-500">Loading…</div>}

      {!loading && error && (
        <div className="text-center text-red-600">{error}</div>
      )}

      {!loading && !error && (
        <>
          {/* Summary */}
          <div className="text-center mt-3 mb-2">
            <span className="inline-block px-4 py-2 bg-white rounded-xl shadow text-sm font-semibold">
              Total Invested: {money(totalInvested)}
            </span>
          </div>

          {/* Open Holdings */}
          <h3 className="text-center text-lg font-semibold mt-3 mb-4">
            Open Holdings
          </h3>

          {data.open.length === 0 ? (
            <div className="text-center text-sm text-gray-500">
              No holdings in portfolio.
            </div>
          ) : (
            <div className="space-y-3">
              {data.open.map((p, i) => {
                const symbol = (p.symbol || p.script || "").toUpperCase();
                const seg = (p.segment || "delivery").toLowerCase();

                const qty = toNum(p.qty) ?? 0;
                const avg = toNum(p.avg_price) ?? 0;
                const entry = toNum(p.entry_price) ?? avg; // fall back to avg
                const sl = toNum(p.stoploss) ?? 0;
                const tgt = toNum(p.target) ?? 0;

                const invest = qty * avg;

                const q = quotes[symbol] || {};
                const live = toNum(q.price) ?? toNum(p.current_price) ?? avg;

                // ---- RIGHT SIDE CALC (match Positions/OpenTrades) ----
                const perShare = entry && live ? live - entry : 0; // live - entry
                const absPct = entry ? (perShare / entry) * 100 : 0; // %
                const total = perShare * qty; // (live - entry) * qty

                const pnlColor =
                  total > 0
                    ? "text-green-600"
                    : total < 0
                    ? "text-red-600"
                    : "text-gray-600";

                return (
                  <div
                    key={`${symbol}-${i}`}
                    className="p-4 rounded-xl shadow bg-white hover:shadow-md transition cursor-pointer"
                    onClick={() =>
                      setSelected({
                        ...p,
                        symbol,
                        live,
                        pnlPerShare: perShare,
                      })
                    }
                  >
                    {/* Top meta row */}
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-semibold">
                        BUY • {qty} Qty
                      </span>
                    </div>

                    {/* Main row */}
                    <div className="mt-1 flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xl font-bold text-gray-800">
                          {symbol}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <SegmentBadge segment={seg} />
                          <span className="text-xs text-gray-600">
                            Live:{" "}
                            <span className="font-semibold text-gray-800">
                              {money(live)}
                            </span>
                          </span>
                          <span className="text-[11px] text-gray-500 border rounded px-1">
                            NSE
                          </span>
                        </div>
                      </div>

                      {/* RIGHT SIDE — identical idea to Positions */}
                      <div className="flex items-start gap-2 pr-1">
                        <div className="w-8 h-8 mt-0.5 rounded-lg bg-blue-100 flex items-center justify-center">
                          {total >= 0 ? (
                            <ArrowUpRight size={16} className="text-blue-700" />
                          ) : (
                            <ArrowDownRight
                              size={16}
                              className="text-blue-700"
                            />
                          )}
                        </div>
                        <div className="text-right">
                          {/* (live - entry) * qty */}
                          <div className={`text-base font-semibold ${pnlColor}`}>
                            {money(total)}
                          </div>
                          {/* live - entry  and  absolute % */}
                          <div className={`text-xs mt-1 ${pnlColor}`}>
                            {signed(perShare, 4)} ({signed(absPct, 2)}%)
                          </div>
                          {/* Notes button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // prevent opening the modal
                              handleNote(symbol);
                            }}
                            title="Add / View Notes"
                            className="inline-flex items-center gap-1 text-xs mt-2 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
                          >
                            <NotebookPen size={14} />
                            <span>Notes</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Chips row — show SL/Target */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Chip label="Entry Price" value={money(entry)} />
                      <Chip label="SL" value={money(sl)} tone="red" />
                      <Chip label="Target" value={money(tgt)} tone="green" />
                    </div>

                    {/* Footer line */}
                    <div className="flex justify-between text-xs mt-2">
                      <span className="text-gray-500">
                        NSE | Total Investment={money(invest)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Modal (Add / Exit / Close) */}
      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96 relative">
            {/* Close X */}
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-lg font-bold"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-blue-600 mb-1">
              {selected.symbol}
            </h3>

            <div className="text-2xl font-extrabold text-center">
              {money(selected.live)}
            </div>
            <div className="text-center mb-4 text-gray-500"> </div>

            <div className="space-y-1 text-sm">
              <div>Qty: {selected.qty}</div>
              <div>Avg Price: {money(selected.avg_price)}</div>
              <div>
                Entry Price: {money(selected.entry_price ?? selected.avg_price)}
              </div>
              <div>Stoploss: {money(selected.stoploss ?? 0)}</div>
              <div>Target: {money(selected.target ?? 0)}</div>
              <div>Current Price: {money(selected.live)}</div>
              <div>
                P&L / Share:{" "}
                <span
                  className={`font-semibold ${
                    (selected.pnlPerShare ?? 0) >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {money(selected.pnlPerShare ?? 0)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-around border-t pt-4 mt-4">
              <button
                onClick={() => {
                  handleAdd(selected.symbol);
                  handleCloseModal();
                }}
                className="px-4 py-2 rounded-lg bg-green-500 text-white font-semibold hover:bg-green-600"
              >
                Add
              </button>
              <button
                onClick={() => {
                  handleExit(selected.symbol);
                  handleCloseModal();
                }}
                className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600"
              >
                Exit
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-lg bg-gray-600 text-white font-semibold hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
