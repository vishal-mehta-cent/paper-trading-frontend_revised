// frontend/src/components/SearchBar.jsx
import React, { useState, useEffect } from "react";

export default function SearchBar({ onSelect }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // 🔁 Fetch matching scripts from backend
  const fetchSuggestions = (searchTerm = "") => {
    fetch(`http://127.0.0.1:8000/search?q=${encodeURIComponent(searchTerm)}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setSuggestions(data.slice(0, 15));
        } else {
          setSuggestions([]);
        }
      })
      .catch((err) => {
        console.error("❌ Script search error:", err);
        setSuggestions([]);
      });
  };

  // 🔍 On input change → fetch suggestions
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSuggestions(query);
    }, 300); // debounce

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // 🔽 Open dropdown when focused
  const handleFocus = () => {
    setShowDropdown(true);
    if (suggestions.length === 0) fetchSuggestions(""); // fetch all initially
  };

  const handleSelect = (symbol) => {
    setQuery(symbol);
    setShowDropdown(false);
    onSelect(symbol);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <input
        type="text"
        value={query}
        placeholder="Search script…"
        onChange={(e) => setQuery(e.target.value)}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
        className="w-full p-2 border rounded focus:outline-none"
      />

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border w-full mt-1 rounded shadow max-h-60 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.symbol}
              onClick={() => handleSelect(s.symbol)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
            >
              <span className="font-medium">{s.symbol}</span>{" "}
              <span className="text-gray-500">({s.name})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
