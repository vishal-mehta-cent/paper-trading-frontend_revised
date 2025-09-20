// src/lib/api.js
// Single source of truth for backend base URL.
// Reads from Vercel/Vite env at build time, then falls back to a safe default.

const ENV_BASE =
  (typeof import !== "undefined" && typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_BASE_URL) ||
  (typeof window !== "undefined" && window.__ENV && window.__ENV.VITE_BACKEND_BASE_URL) ||
  "https://paper-trading-backend-sqllite.onrender.com";

export const API_BASE = String(ENV_BASE).replace(/\/+$/, "");

export function joinApi(path) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(pathOrReq, options) {
  // Convenience for typed calls
  if (typeof pathOrReq === "string") {
    return fetch(joinApi(pathOrReq), options);
  }
  return fetch(pathOrReq, options);
}