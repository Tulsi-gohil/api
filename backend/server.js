require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dbcon= require("./libs/db")
const he =require("he");

const Search = require("./models/Search");

const app = express();
app.use(cors());
app.use(express.json());
 
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
 
    const response2 = await axios.get(
      `https://lab.stealthmole.com/report/credentials?domain_id=${domainID}`,
   { },
      {
        headers: {
          "Content-Type": "application/json",
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

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
