// src/components/BackButton.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ to }) {
  const nav = useNavigate();

  return (
    <button
      onClick={() => (to ? nav(to) : nav(-1))}
      className="absolute top-4 left-4 flex items-center text-gray-600 hover:text-blue-600"
    >
      <ArrowLeft size={20} className="mr-1" />
      <span className="text-sm font-medium">Back</span>
    </button>
  );
}
