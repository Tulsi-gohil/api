require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dbcon= require("./libs/db");
const he =require("he");
const cheerio = require("cheerio");
const qs =require("qs");
 
 
 

const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");
const Search = require("./models/Search");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

 
dbcon();
// Test route
app.get("/", (req, res) => {
  res.send("API running 🚀");
});

// 🔍 Search API
app.post("/api/search", async (req, res) => {
  try {

    const { query } = req.body;
  console.log("BODY RECEIVED:", req.body);

    if (!query) {
      return res.status(400).json({ message: "Search query required" });
    }

    // Call Google via SerpAPI
    const response = await axios.get("https://serpapi.com/search", {
      params: {
        q: query,
        engine: "google",
        api_key: process.env.SERP_API_KEY,
      },
    });

    const results = response.data.organic_results || [];

    // Save to MongoDB
    const savedData = await Search.create({
      query,
      results,
    });

      res.json({
        message: "Search successful",
        data: savedData,
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).json({
        message: "Server error",
        error: error.message
      });
    }});

 
app.post("/api/account", async (req, res) => {
  const { email } = req.body;

  // ✅ Basic validation
  if (!email || email.length !== 10) {
    return res.status(400).json({
      message: "Valid 10-digit mobile number required"
    });
  }

  try {
    const response = await axios.get(
      "https://www.amazon.in/ax/claim/intent?arb=bba3dd9b-ae18-431c-a03b-3a5a567b1014&claimType=phoneNumber&openid.return_to=https%3A%2F%2Fwww.amazon.in%2F%3Fref_%3Dnav_ya_signin&openid.assoc_handle=inflex&countryCode=IN&openid.mode=checkid_setup&pageId=inflex&policy_handle=Retail-Checkout&openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0",
      { email },
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "text/html"
        },
        timeout: 10000
      }
    );
  
    const html = he.decode(response.data);
     
    
    let message;

    // 3️⃣ PROJECT DEMO LOGIC
    if (html.includes("Sign In")&& email ) {
      message = " account is found";
    } else if (html.includes("Looks like you are new to Amazon")&&email) {
      message = " account is not found";
    }

    res.json({  
      message
    });

  } catch (error) {
    console.error("SERVER ERROR:", error.message);

    res.status(500).json({
      success: false,
      message: "Server error / Amazon blocked request"
    });
  }
});


app.post("/api/student", async (req, res) => {
  const { enroll } = req.body;

  if (!enroll) {
    return res.status(400).json({
      message: "Enrollment number is required"
    });
  }

  try {
    const response = await axios.get(
      "http://localhost:5000/api/student",
      {
        Enrollment_no: enroll
      },
      {
        headers: {
          "Content-Type": "application/json"   // 🔑 VERY IMPORTANT
        },
        timeout: 10000
      }
    );

    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error("STUDENT API ERROR:", error.response?.data || error.message);

    res.status(error.response?.status || 500).json({
      message: error.response?.data?.message || "Student API error"
    });
  }
});  
const dns = require('node:dns');
dns.setDefaultResultOrder('ipv4first');

app.post("/api/domain", async (req, res) => {
  const { user_input } = req.body;

  if (!user_input) {
    return res.status(400).json({
      success: false,
      message: "Email or domain is required",
    });
  }

  try {
    // 🔹 1️⃣ First API → get domainID
    const Response = await axios.post(
      "https://lab.stealthmole.com/report/check-domain",
      { user_input },
      {
        headers: {
          "Content-Type": "application/json",
          domainID: "c2NhbmluZm9nYS5pbg==",
        },
      }
    );

    const domainID = Response.data.domainID;
  
    if (!domainID) {
      return res.status(404).json({
        success: false,
        message: "Domain ID not found",
      });
    }
 
    const response2 = await axios.post(
      `https://lab.stealthmole.com/report/credentials?domain_id=${domainID}`,
   { },
      {
        headers: {
          "Content-Type": "application/json",
          Cookie:"C27297A778BF5D2DB517F08F36445AE5"
        },
      }
    );

    // 🔹 Final response
    res.json({
      
       result: response2.data,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch domain report",
    });
  }
      }); 

app.post("/api/vahan", async (req, res) => {
  try {
    const response = await axios.get(
      "https://vahan.parivahan.gov.in/nrservices/faces/user/citizen/citizenlogin.xhtml",
      { headers: { "User-Agent": "Mozilla/5.0" } }
    );

    const cookies = response.headers["set-cookie"];
    const sessionCookie = cookies.find(c => c.startsWith("JSESSIONID")).split(";")[0];

    const $ = cheerio.load(response.data);
    const viewState = $("input[name='javax.faces.ViewState']").val();

    const captchaImg = await axios.get(
      "https://vahan.parivahan.gov.in/nrservices/cap_img.jsp",
      {},
      {
        headers: {
          Cookie: sessionCookie,
          "User-Agent": "Mozilla/5.0",
        },
        responseType: "arraybuffer",
      }
    );

    const captchaBase64 = Buffer.from(captchaImg.data).toString("base64");

    res.json({
      success: true,
      captchaBase64,
      viewState,
      sessionCookie,
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

    app.post("/api/login", async (req, res) => {
  try {
    const { mobile_no, captcha, viewState, sessionCookie } = req.body;

    if (!mobile_no || !captcha || !viewState || !sessionCookie) {
      return res.status(400).json({ success: false, message: "Body data missing" });
    }

    const formData = new URLSearchParams();
    formData.append("loginForm", "loginForm");
    formData.append("loginForm:txt_MOBILE_NO", mobile_no);
    formData.append("loginForm:txt_ALPHA_NUMERIC", captcha);
    formData.append("loginForm:btnLogin", "next");
    formData.append("javax.faces.ViewState", viewState);

    const response = await axios.post(
      "https://vahan.parivahan.gov.in/nrservices/faces/user/citizen/citizenlogin.xhtml",
      formData.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0",
          "Cookie": sessionCookie,
          "Referer":
            "https://vahan.parivahan.gov.in/nrservices/faces/user/citizen/citizenlogin.xhtml",
          "Origin": "https://vahan.parivahan.gov.in",
        },
      }
    );

    const html = response.data;

    // 🔍 RESULT CHECK
    if (html.includes("txt_PASSWORD")) {
      return res.json({
        success: true,
        registered: true,
        message: "Password page opened (User registered)",
      });
    }

    if (html.includes("Invalid") || html.includes("not registered")) {
      return res.json({
        success: true,
        registered: false,
        message: "User not registered",
      });
    }

    res.json({
      success: false,
      message: "Captcha wrong or unknown response",
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

  

// app.post("/api/vahan", async (req, res) => {
//   const { mobile_no } = req.body;

//   if (!mobile_no || mobile_no.length !== 10) {
//     return res.status(400).json({
//       success: false,
//       message: "Mobile number required",
//     });
//   }

//   try {
//     // STEP 1: First request (get login page to create session)
//     const response = await axios.get(
//       "https://vahan.parivahan.gov.in/nrservices/faces/user/citizen/citizenlogin.xhtml",
//       { mobile_no},
//       {
//         headers: {
//           "User-Agent": "Mozilla/5.0",
           
//         },
//       }
//     );

//     // STEP 2: Extract JSESSIONID from cookies
//     const cookies = response.headers["set-cookie"];
//     let session = null;

//     if (cookies) {
//       const jsession = cookies.find(c => c.includes("JSESSIONID"));
//       if (jsession) {
//         session = jsession.split(";")[0]; // JSESSIONID=xxxx
//       }
//     }

//     if (!session) {
//       return res.status(400).json({
//         success: false,
//         message: "Session id not found",
//       });
//     }

//     // STEP 3: Load page again using session
//     const response2 = await axios.get(
//       "https://vahan.parivahan.gov.in/nrservices/faces/user/citizen/citizenlogin.xhtml",
//       {
//         headers: {
//           Cookie: session,
//           "User-Agent": "Mozilla/5.0",
//         },
//       }
//     );

//     // STEP 4: Parse HTML
//     const html = response2.data;
//     const $ = cheerio.load(html);

//     // STEP 5: Check password field
//     const password = $("password") ;

//     let message = "User not registered";

//     if (password  ) {
//       message = "User is registered";
//     }

//     res.json({
//       success: true,
//       message,
//     });

//   } catch (err) {
//     console.error(err.message);
//     res.status(500).json({
//       success: false,
//       message: "Vahan check failed",
//     });
//   }
// });

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
