import React, { useState } from "react";
import axios from "axios";

const LoginRegister = (props) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}${endpoint}`,
        {
          username,
          password,
        }
      );

      if (response.status === 200 || response.status === 201) {
        console.log("✅ Login/Register successful");
        props.onLoginSuccess(username); // <-- Callback to parent
      } else {
        alert("Login/Register failed");
      }
    } catch (error) {
      console.error("❌ Error during login/register:", error);
      alert("Login/Register failed");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-semibold mb-4">
        {isLogin ? "Login" : "Register"}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-sm"
      >
        <input
          className="w-full mb-4 p-2 border rounded"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="w-full mb-4 p-2 border rounded"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {isLogin ? "Login" : "Register"}
        </button>
      </form>
      <p className="text-sm">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <span
          className="text-blue-500 hover:underline cursor-pointer"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Register" : "Login"}
        </span>
      </p>
    </div>
  );
};

export default LoginRegister;
