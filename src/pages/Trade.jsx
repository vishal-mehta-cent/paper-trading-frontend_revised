import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ClipboardList, User, Briefcase } from "lucide-react";
import ScriptDetailsModal from "../components/ScriptDetailsModal";
import BackButton from "../components/BackButton";

export default function Trade({ username }) {
  const [tab, setTab] = useState("mylist");
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [quotes, setQuotes] = useState({});
  const [selectedSymbol, setSelectedSymbol] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [totalFunds, setTotalFunds] = useState(0);
  const [availableFunds, setAvailableFunds] = useState(0);
  const intervalRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    fetchWatchlist();
    fetchFunds();
  }, [username]);

  function fetchWatchlist() {
    fetch(`http://127.0.0.1:8000/watchlist/${username}`)
      .then((r) => r.json())
      .then(setWatchlist);
  }

  function fetchFunds() {
  fetch(`http://127.0.0.1:8000/funds/available/${username}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch funds");
      }
      return res.json();
    })
    .then((data) => {
      setTotalFunds(data.total_funds || 0);
      setAvailableFunds(data.available_funds || 0);
    })
    .catch((err) => {
      console.error("Error loading funds:", err);
      setTotalFunds(0);
      setAvailableFunds(0);
    });
}
  function handleRemoveFromWatchlist(symbol) {
    fetch(`http://127.0.0.1:8000/watchlist/${username}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol }),
    }).then(() => fetchWatchlist());
  }

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!watchlist.length) return;

    const fetchQuotes = () => {
      fetch(`http://127.0.0.1:8000/quotes?symbols=${watchlist.join(",")}`)
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
  }, [watchlist]);

  function handleSearch(e) {
    const q = e.target.value;
    setQuery(q);
    fetch(`http://127.0.0.1:8000/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then(setSuggestions);
  }

  function goDetail(sym) {
    const quote = quotes[sym] || {};
    setSelectedSymbol(sym);
    setSelectedQuote(quote);
    setQuery("");
    setSuggestions([]);
  }

  function handleAddToWatchlist() {
    fetch(`http://127.0.0.1:8000/watchlist/${username}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: selectedSymbol }),
    }).then(() => {
      fetchWatchlist();
      setSelectedSymbol(null);
    });
  }

  function handleBuy() {
    nav(`/buy/${selectedSymbol}`);
    setSelectedSymbol(null);
  }

  function handleSell() {
    nav(`/sell/${selectedSymbol}`);
    setSelectedSymbol(null);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-700">
    <BackButton to="/menu" />
      {/* Header */}
      <div className="sticky top-0 z-50 p-4 bg-white rounded-b-2xl shadow relative">
        {/* 💰 Centered Funds Row */}
        <div className="text-center mt-2 text-sm text-gray-100 font-medium bg-gray-800 py-2 rounded mb-3">
          Total Funds: ₹{(totalFunds || 0).toLocaleString()} &nbsp;|&nbsp; Available: ₹{(availableFunds || 0).toLocaleString()}
        </div>

        {/* Center Title & Tabs */}
        <div className="flex flex-col items-center">
          <h1 className="text-2xl font-serif text-gray-800">Watchlist</h1>
          <div className="flex mt-2 space-x-6 text-sm">
            {["mylist", "mustwatch"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`pb-1 ${
                  tab === t
                    ? "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-500"
                }`}
              >
                {t === "mylist" ? "My List" : "Must Watch"}
              </button>
            ))}
          </div>
        </div>

        {/* Right icons */}
        <div className="absolute right-5 top-24 flex items-center space-x-4">
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
      </div>

      {/* Watchlist (My List Tab Only) */}
      {tab === "mylist" && (
        <>
          {/* Search */}
          <div className="bg-gray-600 p-4">
            <div className="relative">
              <Search size={16} className="absolute top-3 left-3 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={handleSearch}
                placeholder="Search & Add"
                className="w-full pl-10 pr-4 py-2 rounded-lg text-gray-800"
              />
            </div>
            {suggestions.length > 0 && (
              <ul className="bg-white rounded-lg shadow mt-2 max-h-60 overflow-auto">
                {suggestions.map((s, i) => (
                  <li
                    key={i}
                    onClick={() => goDetail(s.symbol)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <div className="font-semibold">{s.symbol}</div>
                    <div className="text-sm text-gray-600">{s.name}</div>
                    <div className="text-xs text-gray-400">Sector: {s.sector || "N/A"}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Watchlist Items */}
          <div className="flex-1 overflow-auto p-4 space-y-3 bg-gray-100">
            {watchlist.length === 0 ? (
              <div className="text-center text-gray-500 mt-10">
                No scripts in your watchlist.
              </div>
            ) : (
              watchlist.map((sym) => {
                const q = quotes[sym] || {};
                const isPos = q.change >= 0;
                return (
                  <div
                    key={sym}
                    className="bg-white px-4 py-3 rounded-xl hover:shadow-md flex justify-between items-start cursor-pointer"
                    onClick={() => goDetail(sym)}
                  >
                    <div>
                      <div className="text-lg font-semibold text-gray-800">{sym}</div>
                      <div className="text-xs text-gray-600">
                        {q.exchange || "NSE"}
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="text-right">
                        <div
                          className={`text-xl font-medium ${
                            isPos ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {q.price != null ? q.price.toLocaleString() : "--"}
                        </div>
                        <div className="text-xs text-gray-600">
                          {q.change != null
                            ? `${isPos ? "+" : ""}${q.change.toFixed(2)} (${
                                isPos ? "+" : ""
                              }${q.pct_change.toFixed(2)}%)`
                            : "--"}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWatchlist(sym);
                        }}
                        className="text-xs bg-red-100 text-red-600 rounded px-2 py-0.5 hover:bg-red-200"
                      >
                        &minus;
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Bottom Nav */}
      <div className="flex bg-gray-800 p-2 justify-around">
        <button
          onClick={() => setTab("mylist")}
          className="flex flex-col items-center text-blue-400"
        >
          <Search size={24} />
          <span className="text-xs">Watchlist</span>
        </button>
        <button
          onClick={() => nav("/orders")}
          className="flex flex-col items-center text-gray-400"
        >
          <ClipboardList size={24} />
          <span className="text-xs">Orders</span>
        </button>
      </div>

      {/* Modal */}
      <ScriptDetailsModal
        symbol={selectedSymbol}
        quote={selectedQuote}
        onClose={() => setSelectedSymbol(null)}
        onAdd={handleAddToWatchlist}
        onBuy={handleBuy}
        onSell={handleSell}
      />
    </div>
  );
}
