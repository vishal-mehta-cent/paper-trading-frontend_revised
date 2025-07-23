// frontend/src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// ✅ Import Google OAuth provider
import { GoogleOAuthProvider } from "@react-oauth/google";

// 🔑 Replace this with your real Google Client ID from Google Cloud Console
const GOOGLE_CLIENT_ID = "h.mehtavishal@gmail.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
//import React from "react";
//import ReactDOM from "react-dom/client";
//import App from "./App.jsx";
//import { GoogleOAuthProvider } from "@react-oauth/google";

//ReactDOM.createRoot(document.getElementById("root")).render(
 // <React.StrictMode>
  //<GoogleOAuthProvider clientId="883057537777-c60rqkdv5rjfk8uoe0ejjb4r4av8ig6p.apps.googleusercontent.com">
    //<App />
  //</GoogleOAuthProvider>
  ///</React.StrictMode>
//);
