const API_BASE = "hhttps://636a5705-01ae-4dd6-9b10-7e2ee7066b58-00-2vxhc7qvguss1.pike.replit.dev/";
import { Capacitor } from "@capacitor/core";

const fromEnv = import.meta?.env?.VITE_API_URL;

let DEFAULT = "http://localhost:8000"; // web & desktop dev
if (Capacitor.isNativePlatform()) {
  const platform = Capacitor.getPlatform();
  if (platform === "android") DEFAULT = "http://10.0.2.2:8000";  // host from emulator
  if (platform === "ios")     DEFAULT = "http://127.0.0.1:8000";  // host from iOS sim
}

export const API = fromEnv || DEFAULT;
