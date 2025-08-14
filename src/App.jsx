// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

// Pages
import LoginRegister from "./pages/LoginRegister";
import Menu from "./pages/Menu";
import Trade from "./pages/Trade";
import ScriptDetail from "./pages/ScriptDetail";
import Portfolio from "./pages/Portfolio";
import Orders from "./pages/Orders";
import Recommendation from "./pages/Recommendation";
import Insight from "./pages/Insight";
import IpoTracker from "./pages/IpoTracker";
import Feedback from "./pages/Feedback";
import Profile from "./pages/Profile";
import Buy from "./pages/Buy";
import Sell from "./pages/Sell";
import TradeSuccess from "./pages/TradeSuccess";
import ChartPage from "./pages/Chart";
import SetAlert from "./pages/SetAlert";
import Notes from "./pages/Notes";
import Settings from "./pages/Settings";
import PasswordChange from "./pages/PasswordChange";
import EmailChange from "./pages/EmailChange";
import Funds from "./pages/Funds";       // Funds management
import History from "./pages/History";   // Buy/Sell activity

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  const [username, setUsername] = useState(() =>
    localStorage.getItem("username")
  );

  useEffect(() => {
    if (username) localStorage.setItem("username", username);
    else localStorage.removeItem("username");
  }, [username]);

  const handleLoginSuccess = (user) => {
    setUsername(user);
    // Redirect to menu after login/register
    window.location.href = "/menu";
  };

  const handleLogout = () => setUsername(null);

  return (
    <BrowserRouter>
      {/* Global toast host */}
      <ToastContainer position="top-center" autoClose={2000} />
      <AnimatedRoutes
        username={username}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
    </BrowserRouter>
  );
}

function AnimatedRoutes({ username, onLoginSuccess, onLogout }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Login / Landing */}
        <Route
          path="/"
          element={
            username ? (
              <Navigate to="/menu" replace />
            ) : (
              <LoginRegister onLoginSuccess={onLoginSuccess} />
            )
          }
        />

        {/* Main Menu */}
        <Route
          path="/menu"
          element={
            username ? <Menu logout={onLogout} /> : <Navigate to="/" replace />
          }
        />

        {/* Trade & Watchlist */}
        <Route
          path="/trade"
          element={
            username ? (
              <Trade username={username} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/trade/:symbol"
          element={
            username ? (
              <ScriptDetail username={username} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        {/* Orders */}
        <Route
          path="/orders"
          element={
            username ? (
              <Orders username={username} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/buy/:symbol"
          element={username ? <Buy /> : <Navigate to="/" replace />}
        />
        <Route
          path="/sell/:symbol"
          element={username ? <Sell /> : <Navigate to="/" replace />}
        />
        <Route
          path="/trade-success"
          element={
            username ? <TradeSuccess /> : <Navigate to="/" replace />
          }
        />

        {/* Charting & Tools */}
        <Route
          path="/chart/:symbol"
          element={username ? <ChartPage /> : <Navigate to="/" replace />}
        />
        <Route
          path="/alert/:symbol"
          element={username ? <SetAlert /> : <Navigate to="/" replace />}
        />
        <Route
          path="/notes/:symbol"
          element={username ? <Notes /> : <Navigate to="/" replace />}
        />

        {/* Dashboard Sections */}
        <Route
          path="/portfolio"
          element={
            username ? (
              <Portfolio username={username} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/recommendations"
          element={
            username ? <Recommendation /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/insight"
          element={username ? <Insight /> : <Navigate to="/" replace />}
        />
        <Route
          path="/ipo-tracker"
          element={username ? <IpoTracker /> : <Navigate to="/" replace />}
        />

        {/* Feedback (uses localStorage username per your original code) */}
        <Route
          path="/feedback"
          element={<Feedback username={localStorage.getItem("username")} />}
        />

        {/* Profile & Settings */}
        <Route
          path="/profile"
          element={
            username ? (
              <Profile username={username} logout={onLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/profile/funds"
          element={<Funds username={localStorage.getItem("username")} />}
        />
        <Route
          path="/history"
          element={
            username ? <History username={username} /> : <Navigate to="/" replace />
          }
        />
        <Route
          path="/settings"
          element={username ? <Settings /> : <Navigate to="/" replace />}
        />
        <Route
          path="/settings/change-password"
          element={username ? <PasswordChange /> : <Navigate to="/" replace />}
        />
        <Route
          path="/settings/change-email"
          element={username ? <EmailChange /> : <Navigate to="/" replace />}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
