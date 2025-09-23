import React from "react";
import { useParams } from "react-router-dom";

export default function Chart() {
  const { symbol } = useParams();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center p-4">
      <h1 className="text-xl font-semibold mb-4">{symbol} - Fullscreen Chart</h1>
      <iframe
        title="TradingView"
        src={`https://s.tradingview.com/widgetembed/?symbol=NSE:${symbol}.NS&interval=15&hidesidetoolbar=1&theme=light`}
        width="100%"
        height="500"
        frameBorder="0"
        allowTransparency={true}
        scrolling="no"
        allowFullScreen
      />
    </div>
  );
}