// src/lib/api.js

// Safely read the env at build time; no fragile ==/?: around the token.
const RAW =
  (typeof import.meta !== "undefined" && import.meta.env)
    ? import.meta.env.VITE_BACKEND_BASE_URL
    : undefined;

// Canonical value
export const API_BASE_URL =
  (typeof RAW === "string" && RAW.trim() !== "")
    ? RAW.trim()
    : "http://127.0.0.1:8000";

// Backward compatibility for existing imports:
export const API_BASE = API_BASE_URL;

// Optional tiny fetch helper used across the app
export async function api(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  return res;
}
