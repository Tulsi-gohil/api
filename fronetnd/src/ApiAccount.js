import { useState } from "react";
import "./App.css";

function ApiAccount() {
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [Token, setToken] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!number ) {
      setError("Please enter mobile number");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
 
      const tokenResponse = await fetch("http://localhost:5000/api/amazon",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({})
      }
      ); 
      const tokenResult = await tokenResponse.json();  
      setToken(tokenResult.Token);

      // Step 2: Fetch Account Data
      const accountResponse = await fetch(
        "http://localhost:5000/api/account",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Token: Token,
            Email: number,
          }),
        }
      );

      const accountResult = await accountResponse.json();
 
      setData(accountResult);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app" style={{ padding: "20px" }}>
      <h1>Check Account</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Enter mobile number"
          value={number}
          onChange={(e) => setNumber(e.target.value)}
        />

        <button onClick={handleSearch} disabled={loading}>
          {loading ? "Checking..." : "Search"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
 

      {data && (
        <div>
          <h3>Account Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default ApiAccount;
