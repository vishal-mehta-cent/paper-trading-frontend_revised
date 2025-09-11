// tailwind.config.js
module.exports = {
  darkMode: "class", // ✅ enables class-based dark mode
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // blue-600
        secondary: "#1e293b", // slate-800
      },
    },
  },
  plugins: [],
};
