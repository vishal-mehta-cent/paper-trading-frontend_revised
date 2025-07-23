import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";

// ✅ Replace with your deployed backend URL on Replit
const API_BASE_URL = "https://636a5705-01ae-4dd6-9b10-7e2ee7066b58-00-2vxhc7qvguss1.pike.replit.dev";

export default function LoginRegister({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setIsLoading(true);

    const endpoint = isLogin ? "login" : "register";

    try {
      const res = await fetch(`${API_BASE_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (data.success) {
        if (isLogin) {
          onLoginSuccess(username);
        } else {
          setMessage("✅ " + data.message);
          setMessageType("success");
        }
      } else {
        setMessage("❌ " + data.message);
        setMessageType("error");
      }
    } catch (err) {
      setMessage("❌ Cannot connect to server.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const decoded = jwt_decode(credentialResponse.credential);
    const googleUsername = decoded.email;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: googleUsername }),
      });

      const data = await res.json();
      if (data.success) {
        onLoginSuccess(googleUsername);
      } else {
        setMessage("❌ " + data.message);
        setMessageType("error");
      }
    } catch (err) {
      setMessage("❌ Google login failed");
      setMessageType("error");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96 space-y-4">
        <h2 className="text-2xl font-bold text-center">
          {isLogin ? "Login" : "Register"}
        </h2>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              setIsLogin(true);
              setMessage("");
              setMessageType("");
            }}
            className={`px-4 py-1 rounded ${isLogin ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setMessage("");
              setMessageType("");
            }}
            className={`px-4 py-1 rounded ${!isLogin ? "bg-blue-600 text-white" : "bg-gray-200"}`}
          >
            Register
          </button>
        </div>

        {message && (
          <div className={`text-sm text-center ${messageType === "success" ? "text-green-600" : "text-red-500"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />

          {isLogin && (
            <p className="text-xs text-right text-blue-600 cursor-pointer hover:underline">
              Forgot Password?
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 flex justify-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : isLogin ? "Login" : "Register"}
          </button>
        </form>

        <div className="pt-2 flex justify-center">
          <GoogleLogin onSuccess={handleGoogleSuccess} />
        </div>
      </div>
    </div>
  );
}
