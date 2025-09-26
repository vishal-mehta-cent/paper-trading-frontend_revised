// src/lib/api.js
// Single source of truth for backend base URL.
// Reads from Vercel/Vite env at build time, then falls back to a safe default.

let ENV_BASE = "";

// ✅ Safely check for import.meta.env (only valid inside ESM modules like Vite)
if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_BASE_URL) {
  ENV_BASE = import.meta.env.VITE_BACKEND_BASE_URL;
}
// ✅ Or check if frontend runtime injected env vars (window.__ENV)
else if (typeof window !== "undefined" && window.__ENV && window.__ENV.VITE_BACKEND_BASE_URL) {
  ENV_BASE = window.__ENV.VITE_BACKEND_BASE_URL;
}
// ✅ Fallback to hardcoded backend URL
else {
  ENV_BASE = "https://paper-trading-backend-sqllite.onrender.com";
}

export const API_BASE = String(ENV_BASE).replace(/\/+$/, "");

export function joinApi(path) {
  return `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiFetch(pathOrReq, options) {
  if (typeof pathOrReq === "string") {
    return fetch(joinApi(pathOrReq), options);
  }
  return fetch(pathOrReq, options);
}
