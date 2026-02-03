import { useState } from "react";
import "./App.css";

function ApiAccount() {
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!number) {
      setError("Please enter mobile number");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("https://mediumturquoise-lemur-967744.hostingersite.com/api/account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({  
          email :number
          
         })
      });

      const data = await response.json();

      // ✅ USE BACKEND RESPONSE DIRECTLY
      if (data.message) {
        setMessage(data.message );
      } else {
        setMessage("No response received");
      }

    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app" style={{ padding: "20px" }}>
      <h1>Check Account</h1>

      <div className="search-box">
        <input
          type="number"
          placeholder="Enter mobile number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Checking..." : "Search"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {message && <p>{message}</p>}
    </div>
  );
}

export default ApiAccount;
