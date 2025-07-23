// ✅ frontend/src/pages/EmailChange.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";


export default function EmailChange() {
  const nav = useNavigate();

  const [step, setStep] = useState(1); // 1: email + otp, 2: new email input
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [confirmNewEmail, setConfirmNewEmail] = useState("");

  const sendOtp = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/send-email-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      toast.success("OTP sent to email");
      setStep(2);
    } catch {
      toast.error("Failed to send OTP");
    }
  };

  const updateEmail = async () => {
    if (newEmail !== confirmNewEmail) {
      toast.error("Emails do not match");
      return;
    }
    try {
      const res = await fetch("http://127.0.0.1:8000/update-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          old_email: email,
          otp,
          new_email: newEmail,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Email updated successfully!");
      nav("/profile");
    } catch {
      toast.error("Email update failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen p-4 max-w-md mx-auto">
      <BackButton to="/settings" />
      <h2 className="text-xl font-semibold text-center mb-6">Email Change</h2>

      {step === 1 && (
        <div className="border rounded p-4">
          <p className="font-medium mb-2">Confirm Email</p>
          <input
            type="email"
            placeholder="Enter current email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />
          <button
            onClick={sendOtp}
            className="text-sm text-blue-600 hover:underline"
          >
            SEND VERIFICATION CODE
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="border rounded p-4">
          <p className="font-medium mb-2">Verify OTP</p>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full mb-3 p-2 border rounded"
          />

          <p className="font-medium mb-2">New Email</p>
          <input
            type="email"
            placeholder="New Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="email"
            placeholder="Confirm New Email"
            value={confirmNewEmail}
            onChange={(e) => setConfirmNewEmail(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
          />

          <button
            onClick={updateEmail}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Change
          </button>
        </div>
      )}
    </div>
  );
}