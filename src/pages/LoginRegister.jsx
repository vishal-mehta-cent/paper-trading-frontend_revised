import React, { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function LoginRegister({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const endpoint = isLogin ? "login" : "register";
      const response = await axios.post(`${BASE_URL}/auth/${endpoint}`, {
        username,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem("username", username);
        onLoginSuccess(username);
      } else {
        setError("Unexpected response from server.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Login/Register failed");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const decoded = jwt_decode(credentialResponse.credential);
    const name = decoded.name || decoded.email;

    try {
      const response = await axios.post(`${BASE_URL}/auth/google-login`, {
        token: credentialResponse.credential,
      });

      if (response.status === 200) {
        localStorage.setItem("username", name);
        onLoginSuccess(name);
      } else {
        setError("Google login failed.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Google login failed");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">
          {isLogin ? "Login" : "Register"}
        </h2>

        {error && (
          <p className="text-red-500 text-center text-sm mb-2">{error}</p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 border border-gray-300 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {isLogin ? "Login" : "Register"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            {isLogin ? "Register" : "Login"}
          </span>
        </p>

        <div className="mt-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("Google Sign In Failed")}
          />
        </div>
      </div>
    </div>
  );
}