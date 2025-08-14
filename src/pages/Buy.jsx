// frontend/src/pages/Buy.jsx
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
  const [successText, setSuccessText] = useState("");
  const [livePrice, setLivePrice] = useState(null);

  const [orderMode, setOrderMode] = useState("MARKET"); // MARKET or LIMIT
  const [submitting, setSubmitting] = useState(false);

  const username = localStorage.getItem("username");

  // -------- Live price (immediate + polling) --------
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
            // If LIMIT selected and price empty, auto-fill with live
            if (orderMode === "LIMIT" && !price) {
              setPrice(live.toFixed(2));
            }
          }
        }
      } catch {
        /* ignore */
      }
    };

    // call immediately, then poll
    fetchLive();
    const id = setInterval(fetchLive, 3000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol, orderMode]); // (avoid putting `price` or `API` here)

  const playSuccessSound = () => {
    try {
      const audio = new Audio("/success.mp3"); // put success.mp3 in public/
      audio.play();
    } catch {
      /* ignore sound errors */
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg("");
    setSuccessText("");

    try {
      if (!username) {
        throw new Error("❌ Please login again (username missing).");
      }
      if (!symbol) {
        throw new Error("❌ Invalid symbol.");
      }
      const qtyNum = Number(qty);
      if (!Number.isFinite(qtyNum) || qtyNum <= 0) {
        throw new Error("❌ Please enter a valid quantity (> 0).");
      }

      // Build payload for backend
      const payload = {
        username,
        script: symbol.toUpperCase(),
        order_type: "BUY",     // BUY action
        qty: qtyNum,
        exchange,
        segment,
      };

      if (orderMode === "LIMIT") {
        const px = Number(price);
        if (!Number.isFinite(px) || px <= 0) {
          throw new Error("❌ Please enter a valid limit price.");
        }
        payload.price = px; // LIMIT trigger price
      } else {
        payload.price = null; // MARKET; backend should use current live
      }

      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.detail || "Order failed");
      }

      // ---- Decide popup text based on backend response ----
      // We support multiple shapes for robustness:
      // - { triggered: true/false }
      // - { message: "EXECUTED" | "PLACED" }
      // - { status: "filled" | "open" }
      const triggered =
        data.triggered === true ||
        String(data?.message || "").toUpperCase() === "EXECUTED" ||
        String(data?.status || "").toLowerCase() === "filled";

      if (triggered) {
        setSuccessText("Buy successfully");
      } else {
        setSuccessText("Order is placed");
      }

      playSuccessSound();
      setSuccessModal(true);

      // Reset some inputs (keep symbol)
      setQty("");
      if (orderMode === "LIMIT") setPrice("");

      // navigate to Orders after a brief pause
      setTimeout(() => {
        setSuccessModal(false);
        nav("/orders");
      }, 1500);
    } catch (e) {
      setErrorMsg(e.message || "Server error");
    } finally {
      setSubmitting(false);
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
            {errorMsg}
          </div>
        )}

        {/* Live Price */}
        <div className="text-sm text-center text-gray-700 mb-2">
          Live Price:{" "}
          <span className="font-semibold text-green-600">
            {livePrice != null ? `₹${livePrice.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : "--"}
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

        {/* Optional SL/Target */}
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
        disabled={submitting}
        className={`mt-6 w-full py-3 text-white text-lg font-semibold rounded-lg ${
          submitting ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {submitting ? "Placing…" : "BUY"}
      </button>

      {/* Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg">
            <div className="mb-3">
              <div className="animate-bounce text-green-600 text-6xl">✅</div>
            </div>
            <p className="text-lg font-semibold text-green-700">
              {successText || "Order is placed"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
