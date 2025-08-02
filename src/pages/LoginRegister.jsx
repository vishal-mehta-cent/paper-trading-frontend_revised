import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export default function LoginRegister({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "login" : "register";

    try {
      const res = await fetch(`${BACKEND_URL}/auth/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.user || username); // call parent handler ✅
      } else {
        setError(data.detail || "Authentication failed");
      }
    } catch (err) {
      setError("Server error");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwt_decode(credentialResponse.credential);
      const res = await fetch(`${BACKEND_URL}/auth/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: decoded.email }),
      });

      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.user || decoded.email); // call parent handler ✅
      } else {
        setError(data.detail || "Google login failed");
      }
    } catch (err) {
      setError("Google login error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isLogin ? "Login" : "Register"}
        </h2>

        <form onSubmit={handleSubmit}>
          <input
            placeholder="Username"
            className="w-full mb-2 px-3 py-2 border rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            placeholder="Password"
            type="password"
            className="w-full mb-2 px-3 py-2 border rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-3 text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            className="text-blue-500 hover:underline"
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Register" : "Login"}
          </button>
        </p>

        <div className="my-4 text-center">OR</div>
        <GoogleLogin onSuccess={handleGoogleSuccess} />

        {error && (
          <p className="text-red-600 mt-2 text-center text-sm">{error}</p>
        )}
      </div>
    </div>
  );
}
