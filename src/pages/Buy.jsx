import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const API = "http://localhost:8000"; // keep host consistent with your backend

export default function Buy() {
  const { symbol } = useParams();
  const nav = useNavigate();

  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [exchange, setExchange] = useState("NSE");
  const [segment, setSegment] = useState("intraday");
  const [stoploss, setStoploss] = useState("");
  const [target, setTarget] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [successText, setSuccessText] = useState(""); // dynamic success message
  const [livePrice, setLivePrice] = useState(null);

  const [orderMode, setOrderMode] = useState("MARKET"); // MARKET or LIMIT
  const username = localStorage.getItem("username");

  // Fetch live price periodically
  useEffect(() => {
    if (!symbol) return;

    let cancelled = false;
    const fetchLive = async () => {
      try {
        const res = await fetch(`${API}/quotes?symbols=${symbol}`);
        const data = await res.json();
        if (!cancelled && data && data[0]) {
          const live = Number(data[0].price);
          if (Number.isFinite(live)) {
            setLivePrice(live);
            // If LIMIT selected and price field empty, auto-fill with live
            if (orderMode === "LIMIT" && !price) {
              setPrice(live.toFixed(2));
            }
          }
        }
      } catch {}
    };

    fetchLive();
    const id = setInterval(fetchLive, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [symbol, API, orderMode, price]);

  const playSuccessSound = () => {
    try {
      const audio = new Audio("/success.mp3"); // put success.mp3 in public/
      audio.play();
    } catch {}
  };

  const handleSubmit = async () => {
    setErrorMsg("");
    setSuccessText("");

    if (!username) {
      setErrorMsg("❌ Please login again (username missing).");
      return;
    }
    if (!symbol) {
      setErrorMsg("❌ Invalid symbol.");
      return;
    }
    const qtyNum = Number(qty);
    if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
      setErrorMsg("❌ Please enter a valid quantity (> 0).");
      return;
    }

    // Build payload for backend
    const payload = {
      username,
      script: symbol.toUpperCase(),
      order_type: "BUY",      // your DB uses BUY/SELL in this field
      order_mode: orderMode,  // MARKET or LIMIT (NEW)
      qty: qtyNum,
      exchange,
      segment,
    };

    if (orderMode === "LIMIT") {
      const px = Number(price);
      if (!Number.isFinite(px) || px <= 0) {
        setErrorMsg("❌ Please enter a valid limit price.");
        return;
      }
      payload.price = px;
    } else {
      // MARKET: backend will use current live price
      payload.price = null;
    }

    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.detail || "Order failed");
      }

      // Frontend text as per requirement
      if (orderMode === "MARKET") {
        setSuccessText("Order is successfully placed.");
      } else {
        setSuccessText("Buy successfully.");
      }

      playSuccessSound();
      setSuccessModal(true);

      // Reset some inputs (keep symbol)
      setQty("");
      if (orderMode === "LIMIT") setPrice("");

      // Optionally navigate after a short delay
      setTimeout(() => {
        setSuccessModal(false);
        nav("/orders");
      }, 3000);
    } catch (e) {
      setErrorMsg(e.message || "Server error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:max-w-xl md:mx-auto flex flex-col justify-between">
      <BackButton to="/trade" />
      <div className="space-y-5">
        <h2 className="text-2xl font-bold text-center text-green-600">
          BUY {symbol}
        </h2>

        {errorMsg && (
          <div className="text-red-700 bg-red-100 p-3 rounded text-center">
            ❌ {errorMsg}
          </div>
        )}

        {/* Live Price */}
        <div className="text-sm text-center text-gray-700 mb-2">
          Live Price:{" "}
          <span className="font-semibold text-green-600">
            {livePrice != null ? `₹${livePrice.toFixed(2)}` : "--"}
          </span>
        </div>

        {/* Order Mode */}
        <div className="flex justify-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ordermode"
              value="MARKET"
              checked={orderMode === "MARKET"}
              onChange={() => setOrderMode("MARKET")}
            />
            <span>Buy @ Live (Market)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="ordermode"
              value="LIMIT"
              checked={orderMode === "LIMIT"}
              onChange={() => setOrderMode("LIMIT")}
            />
            <span>Buy @ My Price (Limit)</span>
          </label>
        </div>

        {/* Quantity */}
        <input
          type="number"
          inputMode="numeric"
          pattern="\d*"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Quantity"
          className="w-full px-4 py-3 border rounded-lg"
        />

        {/* Price (for LIMIT) */}
        <input
          type="number"
          inputMode="decimal"
          pattern="\d*"
          value={orderMode === "LIMIT" ? price : ""}
          onChange={(e) => setPrice(e.target.value)}
          placeholder={orderMode === "LIMIT" ? "Limit Price" : "Disabled for Market orders"}
          className={`w-full px-4 py-3 border rounded-lg ${
            orderMode === "MARKET" ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
          disabled={orderMode === "MARKET"}
        />

        {/* Segment */}
        <div className="flex justify-between">
          <button
            onClick={() => setSegment("intraday")}
            className={`w-1/2 py-2 rounded-l-lg ${
              segment === "intraday" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Intraday
          </button>
          <button
            onClick={() => setSegment("delivery")}
            className={`w-1/2 py-2 rounded-r-lg ${
              segment === "delivery" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Delivery
          </button>
        </div>

        {/* Exchange */}
        <div className="flex justify-between">
          <button
            onClick={() => setExchange("NSE")}
            className={`w-1/2 py-2 rounded-l-lg ${
              exchange === "NSE" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            NSE
          </button>
          <button
            onClick={() => setExchange("BSE")}
            className={`w-1/2 py-2 rounded-r-lg ${
              exchange === "BSE" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            BSE
          </button>
        </div>

        {/* Optional SL/Target (kept in state for future use) */}
        <input
          type="number"
          value={stoploss}
          onChange={(e) => setStoploss(e.target.value)}
          placeholder="Stoploss (optional)"
          className="w-full px-4 py-3 border rounded-lg"
        />
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="Target (optional)"
          className="w-full px-4 py-3 border rounded-lg"
        />
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 w-full py-3 bg-green-600 text-white text-lg font-semibold rounded-lg"
      >
        BUY
      </button>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg">
            <div className="mb-3">
              <div className="animate-bounce text-green-600 text-6xl">✅</div>
            </div>
            <p className="text-lg font-semibold text-green-700">
              {successText || "Order is successfully placed."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}