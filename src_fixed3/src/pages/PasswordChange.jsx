// ✅ frontend/src/pages/PasswordChange.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import BackButton from "../components/BackButton";


export default function PasswordChange() {
  const [step, setStep] = useState("normal"); // 'normal' or 'forgot'
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  const handleChangePassword = async () => {
    if (newPass !== confirmPass) return toast.error("Passwords do not match");
    try {
      const res = await fetch("http://127.0.0.1:8000/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ old_password: currPass, new_password: newPass }),
      });
      if (!res.ok) throw new Error();
      toast.success("Password updated successfully");
      setCurrPass(""); setNewPass(""); setConfirmPass("");
    } catch {
      toast.error("Failed to update password");
    }
  };

  const handleSendOtp = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      toast.success("OTP sent to email");
    } catch {
      toast.error("Failed to send OTP");
    }
  };

  const handleResetPassword = async () => {
    if (newPass !== confirmPass) return toast.error("Passwords do not match");
    try {
      const res = await fetch("http://127.0.0.1:8000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, new_password: newPass }),
      });
      if (!res.ok) throw new Error();
      toast.success("Password reset successful");
      setStep("normal");
    } catch {
      toast.error("Failed to reset password");
    }
  };

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto">
      <BackButton to="/settings" />
      <h2 className="text-xl font-semibold text-center mb-6">Password Change</h2>

      {step === "normal" && (
        <>
          <input
            type="password"
            placeholder="Current Password"
            value={currPass}
            onChange={(e) => setCurrPass(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <button
            onClick={handleChangePassword}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Change Password
          </button>

          <div className="text-sm text-center mt-4">
            <button onClick={() => setStep("forgot")} className="text-blue-600 underline">
              Forgot Password?
            </button>
          </div>
        </>
      )}

      {step === "forgot" && (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <button
            onClick={handleSendOtp}
            className="w-full bg-yellow-600 text-white py-2 rounded hover:bg-yellow-700 mb-4"
          >
            Send Verification Code
          </button>

          <input
            type="text"
            placeholder="OTP Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="New Password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <button
            onClick={handleResetPassword}
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Reset Password
          </button>
        </>
      )}
    </div>
  );
}
