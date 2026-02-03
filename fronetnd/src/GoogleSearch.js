import { useState } from "react";
import axios from "axios";
import "./App.css";
function GoogleSearch (){

        const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!query) {
      setError("Please enter search text");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await axios.post("http://localhost:5000/api/search", {
        query: query,
      });

      setResults(res.data.data.results);
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app" style={{padding: "20px"} }>

      <h1>🔍 Google Search</h1>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      <div className="results">
        {results.map((item, index) => (
          <div key={index} className="card">
            <a href={item.link} target="_blank" rel="noreferrer">
              <h3>{item.title}</h3>
            </a>
            <p>{item.snippet}</p>
          </div>
        ))}
      </div>
    </div>
  

 
    )
}
export default GoogleSearch;