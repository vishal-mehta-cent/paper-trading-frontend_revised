// frontend/src/pages/ProfileDetail.jsx
import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";

const API =
  import.meta.env.VITE_BACKEND_BASE_URL || "http://127.0.0.1:8000";

const toStr = (v) => (v === undefined || v === null ? "" : String(v).trim());

export default function ProfileDetail() {
  // Hydrate base identity from localStorage
  let lsUser = {};
  try {
    lsUser = JSON.parse(localStorage.getItem("nc_user") || "{}");
  } catch {}

  const [profile, setProfile] = useState({
    username: toStr(lsUser.username) || toStr(localStorage.getItem("username")),
    email: toStr(lsUser.email) || toStr(localStorage.getItem("email")),
    phone: toStr(lsUser.phone) || toStr(localStorage.getItem("phone")),
    full_name: toStr(lsUser.full_name) || toStr(localStorage.getItem("full_name")),
    created_at: toStr(lsUser.created_at) || toStr(localStorage.getItem("created_at")),
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  // Fetch from backend
  useEffect(() => {
    const u = profile.username;
    if (!u) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      setErr("");
      setOk("");
      try {
        const res = await fetch(`${API}/users/${encodeURIComponent(u)}`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setProfile((p) => ({
              ...p,
              username: toStr(data.username) || p.username,
              email: toStr(data.email) || p.email,
              phone: toStr(data.phone) || p.phone,
              full_name: toStr(data.full_name) || p.full_name,
              created_at: toStr(data.created_at) || p.created_at,
            }));
          }
        }
      } catch {}
      if (!cancelled) setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [profile.username]);

  // Validation
  const emailValid = (e) =>
    !!toStr(e) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toStr(e));
  const phoneValid = (p) =>
    !!toStr(p) && /^[0-9+\-() ]{7,20}$/.test(toStr(p)); // accepts +91 etc.

  const handleSave = async () => {
    setErr("");
    setOk("");

    const { username, email, phone } = profile;
    if (!username) return setErr("Missing username.");
    if (!emailValid(email)) return setErr("Please enter a valid email.");
    if (!phoneValid(phone)) return setErr("Please enter a valid phone number.");

    setSaving(true);
    try {
      const res = await fetch(`${API}/users/${encodeURIComponent(username)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, phone }),
      });
      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const j = await res.json();
          if (j?.detail) msg = j.detail;
        } catch {}
        throw new Error(msg);
      }

      // persist to localStorage
      try {
        localStorage.setItem("email", email);
        localStorage.setItem("phone", phone);
        const before = JSON.parse(localStorage.getItem("nc_user") || "{}");
        localStorage.setItem("nc_user", JSON.stringify({ ...before, email, phone }));
      } catch {}

      setOk("Profile updated successfully.");
    } catch (e) {
      setErr(e?.message || "Failed to save profile.");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <BackButton />
      <h1 className="text-center text-2xl font-bold text-blue-600">Profile Details</h1>

      {ok && (
        <div className="mt-4 rounded-md bg-green-50 text-green-700 border border-green-200 px-4 py-2 text-sm">
          {ok}
        </div>
      )}
      {err && (
        <div className="mt-4 rounded-md bg-red-50 text-red-700 border border-red-200 px-4 py-2 text-sm">
          {err}
        </div>
      )}

      <div className="mt-6 bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gray-200" />
          <div>
            <div className="text-xl font-semibold">
              {profile.full_name || profile.username || "—"}
            </div>
            <div className="text-sm text-gray-500">{profile.username || "—"}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl border p-4">
            <label className="text-xs uppercase text-gray-500 block mb-1">Email</label>
            <input
              type="email"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              value={profile.email}
              onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
              placeholder="you@example.com"
            />
            {!emailValid(profile.email) && profile.email && (
              <div className="text-xs text-red-600 mt-1">Invalid email.</div>
            )}
          </div>

          <div className="rounded-xl border p-4">
            <label className="text-xs uppercase text-gray-500 block mb-1">Phone</label>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
              value={profile.phone}
              onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
              placeholder="+91 98765 43210"
            />
            {!phoneValid(profile.phone) && profile.phone && (
              <div className="text-xs text-red-600 mt-1">Invalid phone number.</div>
            )}
          </div>

          {profile.created_at && (
            <div className="rounded-xl border p-4">
              <div className="text-xs uppercase text-gray-500">Joined</div>
              <div className="font-medium">{profile.created_at}</div>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border bg-gray-50 hover:bg-gray-100"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !emailValid(profile.email) || !phoneValid(profile.phone)}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
