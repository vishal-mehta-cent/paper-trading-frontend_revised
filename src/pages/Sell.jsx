import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function Sell() {
  const { symbol } = useParams();
  const nav = useNavigate();

  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [exchange, setExchange] = useState("NSE");
  const [segment, setSegment] = useState("intraday");
  const [stoploss, setStoploss] = useState("");
  const [target, setTarget] = useState("");
  const [error, setError] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [livePrice, setLivePrice] = useState(null);

  // ✅ Fetch Live Price and auto-fill price if empty
  useEffect(() => {
    const fetchLive = () => {
      fetch(`http://127.0.0.1:8000/quotes?symbols=${symbol}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data[0]) {
            const live = parseFloat(data[0].price).toFixed(2);
            setLivePrice(live);
            if (!price) setPrice(live); // auto-fill if price field empty
          }
        });
    };
    fetchLive();
    const interval = setInterval(fetchLive, 3000);
    return () => clearInterval(interval);
  }, [symbol, price]);

 const handleSubmit = () => {
  setError("");

  if (!qty || !price || isNaN(qty) || isNaN(price) || +qty <= 0 || +price <= 0) {
    setError("❌ Please enter valid quantity and price (numbers only).");
    return;
  }

  fetch(`http://127.0.0.1:8000/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: localStorage.getItem("username"),
      script: symbol,
      order_type: "SELL",
      qty: parseInt(qty),
      price: parseFloat(price),
      exchange,
      segment,
    }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const err = await res.json();
        setError(err.detail || "Failed to sell");
      } else {
        playSuccessSound();
        setSuccessModal(true);
        setQty("");
        setPrice("");
        setTimeout(() => {
          setSuccessModal(false);
          nav("/orders");
        }, 4000);
      }
    })
    .catch(() => setError("Server error"));
};

  const playSuccessSound = () => {
    const audio = new Audio("/success.mp3"); // Add success.mp3 in public/
    audio.play();
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:max-w-xl md:mx-auto flex flex-col justify-between">
      <BackButton to="/trade" />
      <div className="space-y-5">
        <h2 className="text-2xl font-bold text-center text-red-600">SELL {symbol}</h2>

        {error && (
          <div className="text-red-700 bg-red-100 p-3 rounded text-center">
            ❌ {error}
          </div>
        )}

        {/* ✅ Live Price */}
        <div className="text-sm text-center text-gray-700 mb-2">
          Live Price: <span className="font-semibold text-red-600">₹{livePrice || "--"}</span>
        </div>

        <input
          type="number"
          inputMode="numeric"
          pattern="\d*"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          placeholder="Quantity"
          className="w-full px-4 py-3 border rounded-lg"
        />

        <input
          type="number"
          inputMode="decimal"
          pattern="\d*"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Limit Price"
          className="w-full px-4 py-3 border rounded-lg"
        />

        <div className="flex justify-between">
          <button
            onClick={() => setSegment("intraday")}
            className={`w-1/2 py-2 rounded-l-lg ${segment === "intraday" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Intraday
          </button>
          <button
            onClick={() => setSegment("delivery")}
            className={`w-1/2 py-2 rounded-r-lg ${segment === "delivery" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Delivery
          </button>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setExchange("NSE")}
            className={`w-1/2 py-2 rounded-l-lg ${exchange === "NSE" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            NSE
          </button>
          <button
            onClick={() => setExchange("BSE")}
            className={`w-1/2 py-2 rounded-r-lg ${exchange === "BSE" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            BSE
          </button>
        </div>

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
        className="mt-6 w-full py-3 bg-red-600 text-white text-lg font-semibold rounded-lg"
      >
        SELL
      </button>

      {/* ✅ Success Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl text-center shadow-lg">
            <div className="mb-3">
              <div className="animate-bounce text-green-600 text-6xl">✅</div>
            </div>
            <p className="text-lg font-semibold text-green-700">
            Order Is Sell Sucessfully
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
