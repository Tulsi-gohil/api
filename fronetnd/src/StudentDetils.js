import { useState } from "react";

function StudentDetils() {
  const [enroll, setEnroll] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!enroll) {
      alert("Please enter enrollment number");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const response = await fetch("http://localhost:5000/api/student", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          enroll: enroll
        })
      });

      const result = await response.json();
      setData(result);

    } catch (err) {
      console.error(err);
      setError("API call failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Student Details</h2>

      {data?.message && <p><b>{data.message}</b></p>}

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter Enrollment Number"
          value={enroll}
          onChange={(e) => setEnroll(e.target.value)}
          style={{ width: "300px", padding: "8px" }}
        />
        <br /><br />
        <button type="submit">Fetch Data</button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data?.studentDetails && (
        <>
          <h3>Student Information</h3>
          <p>Name: {data.studentDetails.name}</p>
          <p>College: {data.studentDetails.college}</p>
          <p>City: {data.studentDetails.city}</p>
          <p>CGPA: {data.studentDetails.cgpa}</p>
        </>
      )}
    </div>
  );
}

export default StudentDetils;
