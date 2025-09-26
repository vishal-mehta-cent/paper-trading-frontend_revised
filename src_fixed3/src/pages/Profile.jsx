import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function Profile({ username, logout }) {
  const nav = useNavigate();
  const [funds, setFunds] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const userEmail = `${username.toLowerCase().replace(/ /g, "")}@gmail.com`;

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/funds/available/${username}`)
      .then((res) => res.json())
      .then((data) => setFunds(data.total_funds || 0))
      .catch(() => setFunds(0));
  }, [username]);

  return (
    <div className="min-h-screen bg-white p-4">
      <BackButton to="/menu" />
      <h2 className="text-xl font-bold text-center text-blue-600 mb-6">ACCOUNT</h2>

      {/* Avatar and Info */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gray-300" />
        <h3 className="mt-2 font-semibold">{username}</h3>
        <p className="text-gray-500 text-sm">{userEmail}</p>
      </div>

      {/* Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => nav("/profile/details")} 
          className="w-full border rounded p-2 text-left">
          👤 Profile
        </button>
        <button
          onClick={() => nav("/profile/funds")}
          className="w-full border rounded p-2 text-left"
        >
          💰 Funds
        </button>
        <button
          onClick={() => nav("/settings")}
          className="w-full border rounded p-2 text-left"
        >
          ⚙️ Settings
        </button>
        <button
          onClick={() => nav("/history")}
          className="w-full border rounded p-2 text-left"
        >
          🧾 History
        </button>
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full border rounded p-2 text-left text-red-600"
        >
          🚪 Logout
        </button>
      </div>

      {/* 🚨 Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center max-w-xs w-full">
            <p className="text-lg font-semibold mb-4">Do you want to logout?</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
              >
                No
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
