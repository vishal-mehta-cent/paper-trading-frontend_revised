import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL; // ✅ Read from env

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
        onLoginSuccess(data.user); // pass user data to parent
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
        onLoginSuccess(data.user);
      } else {
        setError(data.detail || "Google login failed");
      }
    } catch (err) {
      setError("Google login error");
    }
  };

  return (
    <div>
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        /><br />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br />
        <button type="submit">{isLogin ? "Login" : "Register"}</button>
      </form>

      <p>
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Register" : "Login"}
        </button>
      </p>

      <hr />
      <GoogleLogin onSuccess={handleGoogleSuccess} />
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
