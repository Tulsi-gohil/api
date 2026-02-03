import { useState } from "react";

function Domin() {
  const [domin_id, setDomin_id] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!domin_id) {
      setError("Please enter domain or email");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch("https://mediumturquoise-lemur-967744.hostingersite.com/api/domain", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_input: domin_id,
        }),
      });

      const result = await response.json();
      setData(result); // ✅ store SAME response

    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Check Domain / Email</h1>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Enter domain or email"
          value={ domin_id}
          onChange={(e) => setDomin_id(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Checking..." : "Search"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ✅ SHOW RESPONSE EXACTLY */}
      {data &&  (
        <div style={{ marginTop: "20px" }}>
          <h3> Domain report</h3>
          <h2> CDS DATA</h2>
<table border="1" cellPadding="8" cellSpacing="0">
  <thead>
    <tr>
      <th>#</th>
      <th>host</th>
      <th>user</th>
      <th>password</th>
      <th>compromised_date</th>
      <th>username</th>
      <th>victim_ip</th>
    </tr>
  </thead>
 
  <tbody>
  
    {data.result.cds_data.map((item, index) => (
      <tr key={index}>
        <td>{index + 1 || "N/A" }  </td>
        <td>{item.host || "N/A" }</td>
        <td>{item.user || "N/A" }</td>
         <td>{item.password || "N/A" }</td>
        <td>{item.compromised_date || "N/A" }</td>
        
         <td>{item.victim_ip|| "N/A"  }</td>
         <td>{item.username|| "N/A"  }</td>
      </tr>
    ))}
  </tbody>
</table>
<br/>
<hr/>
<h2> UB DATA</h2>
<table border="1" cellPadding="8" cellSpacing="0">
  <thead>
    <tr>
      <th>#</th>
      <th>url</th>
      <th>login</th>
      <th>Leaked Date</th>
      <th>password</th>
    
    </tr>
  </thead>
 
  <tbody>
  
    {data.result.ub_data.map((item, index) => (
      <tr key={index}>
        <td>{index + 1 || "N/A" }  </td>
        <td>{item.url || "N/A" }</td>
        <td>{item.login || "N/A" }</td>
         <td>{item.password || "N/A" }</td>
        <td>{item.leaked_date || "N/A" }</td>
         
      </tr>
    ))}
  </tbody>
</table>
<br/>
<hr/>
<h2> CL DATA</h2>
          <table border="1" cellPadding="8" cellSpacing="0">
  <thead>
    <tr>
      <th>#</th>
      <th>Email</th>
      <th>Password</th>
      <th>Leaked Date</th>
      <th>Leaked From</th>
    </tr>
  </thead>

  <tbody>
  
    {data.result.cl_data.map((item, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.email}</td>
        <td>{item.password}</td>
        <td>{item.leaked_date}</td>
        <td>{item.leaked_from}</td>
      </tr>
    ))}
  </tbody>
</table>

<br/>
<hr/>
<h2>  CB DATA</h2>
          

          <table border="1" cellPadding="8" cellSpacing="0">
  <thead>
    <tr>
      <th>#</th>
      <th>user</th>
      <th>Password</th>
      <th>Leaked Date</th>
     
    </tr>
  </thead>

  <tbody>
  
    {data.result.cb_data.map((item, index) => (
      <tr key={index}>
        <td>{index + 1}</td>
        <td>{item.user}</td>
        <td>{item.password}</td>
        <td>{item.leaked_date}</td>
       
      </tr>
    ))}
  </tbody>
</table>

          
        </div>
      )}
    </>
  );
}

export default Domin;
