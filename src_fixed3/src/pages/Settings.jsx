import React from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto">
      <BackButton to="/profile" /> 
      <h2 className="text-2xl font-semibold text-center mb-6">Settings</h2>

      {/* Theme Toggle */}
      <div className="border rounded p-4 mb-6">
        <p className="mb-2 font-semibold">Theme</p>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input type="radio" name="theme" defaultChecked className="mr-2" />
            Default
          </label>
          <label className="flex items-center">
            <input type="radio" name="theme" className="mr-2" />
            Dark
          </label>
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={() => navigate("/settings/change-password")}
        className="w-full bg-gray-100 border rounded p-3 mb-4 text-left flex justify-between items-center"
      >
        Password Change <span className="text-gray-500">{">"}</span>
      </button>

      <button
        onClick={() => navigate("/settings/change-email")}
        className="w-full bg-gray-100 border rounded p-3 text-left flex justify-between items-center"
      >
        Email Change <span className="text-gray-500">{">"}</span>
      </button>
    </div>
  );
}
