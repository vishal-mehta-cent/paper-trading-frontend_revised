// src/lib/api.js

// Prefer a simple, parse-safe fallback without clever inline comparisons.
const RAW = (typeof import.meta !== 'undefined' && import.meta.env)
  ? import.meta.env.VITE_BACKEND_BASE_URL
  : undefined;

export const API_BASE_URL =
  (typeof RAW === 'string' && RAW.trim() !== '')
    ? RAW.trim()
    : 'http://127.0.0.1:8000';

// (example) small fetch wrapper so imports elsewhere stay unchanged:
export async function api(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  return res;
}
