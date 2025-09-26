// ✅ frontend/src/pages/Menu.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Briefcase,
  ClipboardList,
  Lightbulb,
  Eye,
  BarChart2,
  MessageCircle,
  User
} from "lucide-react";

const items = [
  { label: "Trade",           path: "/trade",           icon: <TrendingUp size={32} /> },
  { label: "Portfolio",       path: "/portfolio",       icon: <Briefcase size={32} /> },
  { label: "Orders",          path: "/orders",          icon: <ClipboardList size={32} /> },
  { label: "Recommendations", path: "/recommendations", icon: <Lightbulb size={32} /> },
  { label: "Insight",         path: "/insight",         icon: <Eye size={32} /> },
  { label: "IPO Tracker",     path: "/ipo-tracker",     icon: <BarChart2 size={32} /> },
  { label: "Feedback / Contact", path: "/feedback",     icon: <MessageCircle size={32} /> },
  { label: "Profile",         path: "/profile",         icon: <User size={32} /> },
];

export default function Menu({ logout }) {
  const nav = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg bg-white rounded-2xl shadow-xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Main Menu</h2>
          <button
            onClick={logout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Icon Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <button
              key={item.path}
              onClick={() => nav(item.path)}
              className="flex flex-col items-center focus:outline-none"
            >
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                {item.icon}
              </div>
              <span className="mt-2 text-sm font-medium text-gray-700 text-center">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
