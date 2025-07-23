// ✅ ScriptDetail.jsx - With Day's Range Slider (Open → Current → Buy Price)
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, FileText, ArrowRight } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Tooltip
);

export default function ScriptDetail({ username }) {
  const { symbol } = useParams();
  const nav = useNavigate();

  const [quote, setQuote] = useState(null);
  const [hist, setHist] = useState([]);
  const [qty, setQty] = useState(1);
  const [buyPrice, setBuyPrice] = useState("");

  useEffect(() => {
    const fetchQuote = () => {
      fetch(`http://127.0.0.1:8000/quotes?symbols=${symbol}`)
        .then((r) => r.json())
        .then((arr) => setQuote(arr[0] || null));
    };
    fetchQuote();
    const id = setInterval(fetchQuote, 2000);
    return () => clearInterval(id);
  }, [symbol]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/historical?symbol=${symbol}&period=1mo`)
      .then((r) => r.json())
      .then(setHist);
  }, [symbol]);

  if (!quote) {
    return (
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300 }}
        className="fixed inset-0 bg-white flex items-center justify-center"
      >
        Loading…
      </motion.div>
    );
  }

  const data = {
    labels: hist.map((d) => new Date(d.date)),
    datasets: [
      {
        label: `${symbol} Close`,
        data: hist.map((d) => d.close),
        fill: false,
        tension: 0.2,
      },
    ],
  };

  const options = {
    scales: {
      x: { type: "time", time: { unit: "day" } },
      y: { beginAtZero: false },
    },
    plugins: { tooltip: { mode: "index", intersect: false } },
  };

  // Range Bar Calculation
  const open = quote.open || 0;
  const current = quote.price || 0;
  const buy = parseFloat(buyPrice) || 0;
  const barWidth = Math.abs(current - open);
  const pointerPos = open && current
    ? ((buy - open) / (current - open)) * 100
    : 0;

  const pointerStyle = {
    left: `${Math.min(100, Math.max(0, pointerPos))}%`,
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 300 }}
      className="fixed inset-0 bg-white overflow-auto p-4"
    >
      <div className="text-center mb-4">
        <h1 className="text-2xl font-serif">{symbol}</h1>
        <p className="text-sm text-gray-500">{quote.exchange}</p>
      </div>

      <div className="flex items-baseline justify-center space-x-4 mb-6">
        <span className="text-4xl font-bold">{quote.price.toLocaleString()}</span>
        <span className={quote.change >= 0 ? "text-green-600" : "text-red-600"}>
          {quote.change >= 0 ? "+" : ""}
          {quote.change.toFixed(2)} ({quote.pct_change.toFixed(2)}%)
        </span>
      </div>

      {/* Quantity & Buy Button */}
      <div className="flex flex-col items-center space-y-3 mb-6">
        <input
          type="number"
          placeholder="Qty"
          value={qty}
          min={1}
          onChange={(e) => setQty(+e.target.value)}
          className="w-32 text-center border p-2 rounded"
        />
        <input
          type="number"
          placeholder="Your Buy Price"
          value={buyPrice}
          onChange={(e) => setBuyPrice(e.target.value)}
          className="w-40 text-center border p-2 rounded"
        />
        <div className="flex space-x-4">
          <button
            onClick={() => nav(`/buy/${symbol}`)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            BUY
          </button>
          <button
            onClick={() => nav(`/sell/${symbol}`)}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            SELL
          </button>
        </div>
      </div>

      {/* Chart Link */}
      <div className="flex justify-center items-center mb-6 text-gray-800 cursor-pointer space-x-1"
        onClick={() => nav(`/chart/${symbol}`)}>
        <span>View Chart</span>
        <ArrowRight size={16} />
      </div>

      {/* Chart */}
      <div className="mb-8">
        <Line data={data} options={options} />
      </div>

      {/* Day's Range Slider */}
      <div className="mb-10">
        <p className="font-medium text-center mb-2">Day’s Range</p>
        <div className="flex justify-between text-xs text-gray-500 px-4 mb-1">
          <span>₹{open.toFixed(2)}</span>
          <span>₹{current.toFixed(2)}</span>
        </div>
        <div className="relative h-1 bg-gray-300 mx-4 rounded">
          <div
            className="absolute top-0 h-1 bg-blue-500 rounded"
            style={{ width: "100%" }}
          />
          {/* Pointer */}
          <div
            className="absolute top-[-6px] w-0 h-0 border-l-4 border-r-4 border-b-8 border-transparent border-b-gray-500"
            style={pointerStyle}
          />
        </div>
        <p className="text-center mt-2 text-sm text-gray-500">
          Your Buy Price: ₹{buy ? buy.toFixed(2) : "--"}
        </p>
      </div>

      {/* Alert & Notes */}
      <div className="flex justify-around mb-10">
        <button onClick={() => nav(`/alert/${symbol}`)} className="flex flex-col items-center text-gray-600">
          <Bell size={24} />
          <span className="text-xs mt-1">Set Alert</span>
        </button>
        <button onClick={() => nav(`/notes/${symbol}`)} className="flex flex-col items-center text-gray-600">
          <FileText size={24} />
          <span className="text-xs mt-1">Add Notes</span>
        </button>
      </div>
    </motion.div>
  );
}
