// SAFE FALLBACK for legacy <script src="/src/api.js"></script> usage.
// This is NOT an ES module. Do not use 'export' here.

(function(){
  try {
    var defaultBase = "https://paper-trading-backend-sqllite.onrender.com";
    window.__ENV = window.__ENV || {};
    if (!window.__ENV.VITE_BACKEND_BASE_URL) {
      window.__ENV.VITE_BACKEND_BASE_URL = defaultBase;
    }
  } catch (e) {
    // no-op
  }
})();