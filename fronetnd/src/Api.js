import React, { useState } from "react";

function Api() {
  const [mobile, setMobile] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [viewState, setViewState] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

 
  const loadCaptcha = async () => {
    if (mobile.length !== 10) {
      alert("Enter valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setResult(null);
    setCaptcha("");

    try {
      const res = await fetch("https://mediumturquoise-lemur-967744.hostingersite.com/api/vahan",{
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        
      }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load captcha");
      }

      setCaptchaImg(`data:image/png;base64,${data.captchaBase64}`);
      setViewState(data.viewState);

    } catch (err) {
      alert(err.message);
      setCaptchaImg("");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // STEP 2 - LOGIN
  // ===============================
  const handleLogin = async () => {
    if (!captcha) {
      alert("Enter captcha");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://mediumturquoise-lemur-967744.hostingersite.com/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mobile_no: mobile,
          captcha: captcha,
          viewState: viewState,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      setResult(data.message);

    } catch (err) {
      alert(err.message);
      setCaptcha("");
      setCaptchaImg("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Vahan Mobile Check</h2>

      <input
        type="text"
        placeholder="Enter Mobile Number"
        maxLength={10}
        value={mobile}
        onChange={(e) => {
          setMobile(e.target.value.replace(/\D/g, ""));
          setCaptcha("");
          setCaptchaImg("");
          setResult(null);
        }}
      />

      <br /><br />

      <button onClick={loadCaptcha} disabled={loading}>
        {loading ? "Loading..." : "Get Captcha"}
      </button>

      {captchaImg && (
        <>
          <div style={{ marginTop: 20 }}>
            <img src={captchaImg} alt="captcha" />
          </div>

          <br />

          <input
            type="text"
            placeholder="Enter Captcha"
            value={captcha}
            onChange={(e) => setCaptcha(e.target.value)}
          />

          <br /><br />

          <button onClick={handleLogin} disabled={loading}>
            {loading ? "Please wait..." : "Submit"}
          </button>
        </>
      )}
 
      {result && (
        <h3>Result: {result}</h3>
      )}
    </div>
  );
}

export default Api;
