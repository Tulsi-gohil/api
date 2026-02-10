import { useState } from "react";
import axios from "axios";

function Api() {
  const [mobile, setMobile] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [viewState, setViewState] = useState("");
  const [sessionCookie, setSessionCookie] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // STEP 1: Get captcha + session
  const loadCaptcha = async () => {
    if (mobile.length !== 10) {
      alert("Enter valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setResult(null);
    setCaptcha("");

    try {
      const res = await axios.post("http://localhost:5000/api/vahan");

      setCaptchaImg(`data:image/png;base64,${res.data.captchaBase64}`);
      setViewState(res.data.viewState);
      setSessionCookie(res.data.sessionCookie);
    } catch (err) {
      alert("Failed to load captcha");
    }

    setLoading(false);
  };
// Change the login request to explicitly handle errors
const handleLogin = async () => {
  if (!captcha) return alert("Enter captcha");
  setLoading(true);

  try {
    const res = await axios.post("http://localhost:5000/api/login", {
      mobile_no: mobile,
      captcha,
      viewState,
      sessionCookie,
    });
    setResult(res.data);
  } catch (err) {
    // Check if the backend sent a specific message
    const errMsg = err.response?.data?.message || "Login failed";
    alert(errMsg);
    setCaptchaImg(""); // Reset captcha on failure
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ width: 320 }}>
      <h3>Vahan Mobile Check</h3>

      <input
        type="text"
        placeholder="Mobile Number"
        maxLength={10}
        value={mobile}
        onChange={(e) => {
          setMobile(e.target.value.replace(/\D/g, ""));
          setCaptchaImg("");
          setCaptcha("");
          setResult(null);
        }}
      />

      <br /><br />

      <button onClick={loadCaptcha} disabled={loading}>
        {loading ? "Loading..." : "Get Captcha"}
      </button>

      {captchaImg && (
        <>
          <div style={{ margin: "15px 0" }}>
            <img src={captchaImg} alt="captcha" />
          </div>

          <input
            type="text"
            placeholder="Enter Captcha"
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value)}
          />

          <br /><br />

          <button onClick={handleLogin} disabled={loading}>
            Submit
          </button>
        </>
      )}

      {result && (
        <pre style={{ marginTop: 15 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default Api;
