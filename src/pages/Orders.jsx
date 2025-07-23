// frontend/src/pages/Orders.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ScriptDetailsModal from "../components/ScriptDetailsModal";
import { ClipboardList, Search, Briefcase, User } from "lucide-react";
import BackButton from "../components/BackButton";

export default function Orders({ username }) {
  const [openOrders, setOpenOrders] = useState([]);
  const [positions, setPositions] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [tab, setTab] = useState("open");
  const [selectedScript, setSelectedScript] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const intervalRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/orders/${username}`)
      .then((res) => res.json())
      .then((data) => {
        setOpenOrders(data.open);
        setPositions(data.positions || []);
      });
  }, [username]);

  useEffect(() => {
    const allSymbols = [...openOrders, ...positions].map((o) => o.script);
    if (!allSymbols.length) return;

    const fetchQuotes = () => {
      fetch(`http://127.0.0.1:8000/quotes?symbols=${allSymbols.join(",")}`)
        .then((r) => r.json())
        .then((arr) => {
          const map = {};
          arr.forEach((q) => (map[q.symbol] = q));
          setQuotes(map);
        });
    };

    fetchQuotes();
    intervalRef.current = setInterval(fetchQuotes, 2000);
    return () => clearInterval(intervalRef.current);
  }, [openOrders, positions]);

  const ordersToShow = tab === "open" ? openOrders : positions;

  function openDetail(order) {
    setSelectedScript(order.script);
    setSelectedOrder(order);
  }

  function closeModal() {
    setSelectedScript(null);
    setSelectedOrder(null);
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-gray-100">
      <BackButton to="/menu" />
      <div className="p-4">
        <h2 className="text-2xl font-bold text-center text-gray-700 mb-4">Orders</h2>

        {/* Tabs */}
        <div className="flex justify-center mb-4 space-x-6">
          {["open", "positions"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-1 text-sm font-medium ${
                tab === t ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500"
              }`}
            >
              {t === "open" ? "Open Trades" : "Positions"}
            </button>
          ))}
        </div>

        {/* No Orders */}
        {ordersToShow.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">No {tab} items.</div>
        ) : (
          <div className="space-y-3">
            {ordersToShow.map((o, i) => {
              const q = quotes[o.script] || {};
              const live = q.price ?? o.price;
              const change = q.change ?? 0;
              const pct = q.pct_change ?? 0;
              const pnl = (live - o.price) * o.qty;
              const isProfit = pnl >= 0;
              const isBuy = o.order_type === "BUY";

              return (
                <div
                  key={i}
                  onClick={() => openDetail(o)}
                  className="bg-white p-4 rounded-lg shadow flex justify-between items-center cursor-pointer hover:shadow-md"
                >
                  {/* Left Info */}
                  <div>
                    <div className="text-lg font-semibold">{o.script}</div>
                    <div className="text-sm text-gray-500">
                      {o.order_type} • {o.qty} @ ₹{o.price} • {o.datetime}
                    </div>
                  </div>

                  {/* Center BUY/SELL Icon + Label */}
                  <div
                    className={`text-center px-3 py-1 rounded font-semibold text-sm ${
                      isBuy ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
                    }`}
                  >
                    {isBuy ? "🔼 BUY" : "🔽 SELL"}
                  </div>

                  {/* Right Price + PnL */}
                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold ${
                        isProfit ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isProfit ? "+" : "-"}₹{Math.abs(pnl).toFixed(2)}
                    </div>
                    <div className="text-xs text-gray-600">
                      ₹{live?.toFixed(2)} • {change?.toFixed(2)} ({pct?.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <ScriptDetailsModal
        symbol={selectedScript}
        quote={{ price: selectedOrder?.price }}
        onClose={closeModal}
        onBuy={() => nav(`/buy/${selectedScript}`)}
        onSell={() => nav(`/sell/${selectedScript}`)}
        onAdd={() => {}}
      />

      {/* Floating Profile + Portfolio Icons */}
      <div className="absolute right-5 top-10 flex items-center space-x-4 z-50">
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => nav("/portfolio")}
        >
          <Briefcase size={22} className="text-gray-600 hover:text-blue-600" />
          <span className="text-xs text-gray-500">Portfolio</span>
        </div>
        <div
          className="flex flex-col items-center cursor-pointer"
          onClick={() => nav("/profile")}
        >
          <User size={22} className="text-gray-600 hover:text-blue-600" />
          <span className="text-xs text-gray-500">Profile</span>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="flex bg-gray-800 p-2 justify-around mt-auto">
        <button
          onClick={() => nav("/trade")}
          className="flex flex-col items-center text-gray-400"
        >
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
