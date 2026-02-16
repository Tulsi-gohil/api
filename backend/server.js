require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const dbcon = require("./libs/db");
const he = require("he");
const cheerio = require("cheerio");
const qs = require("qs");
const { wrapper } = require("axios-cookiejar-support");
const { CookieJar } = require("tough-cookie");
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
  }
});

const jar = new CookieJar();
const client = wrapper(
  axios.create({
    jar,
    withCredentials: true,
    headers: {
      "User-Agent": "Mozilla/5.0",
    },
  })
);
app.get("/api/amazon", async (req, res) => {
  try { 
    if (!Email) {
      return res.status(400).json({ message: "Email is required" });
    }
    const response = await client.get("https://www.amazon.in/ax/claim?openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.return_to=https%3A%2F%2Fwww.amazon.in%2F%3F%26tag%3Dgooginhydr1-21%26ref%3Dnav_ya_signin%26adgrpid%3D171770161190%26hvpone%3D%26hvptwo%3D%26hvadid%3D714840681071%26hvpos%3D%26hvnetw%3Dg%26hvrand%3D14807682158325480337%26hvqmt%3De%26hvdev%3Dc%26hvdvcmdl%3D%26hvlocint%3D%26hvlocphy%3D9062203%26hvtargid%3Dkwd-3704926535%26hydadcr%3D18657_2389208%26mcid%3Da684625856e53b7aba1406fdfbcd950e%26gad_source%3D1&policy_handle=Retail-Checkout&openid.mode=checkid_setup&openid.assoc_handle=inflex&arb=afa6fd50-aa24-4f1f-a081-4210bdf7f26f");
    const $ = cheerio.load(response.data);
    const Token = $("input[name='anti-csrftoken-a2z']").val();
    res.json({
      token: Token,

    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: "Failed to fetch token",

    });
  }

});
app.post("/api/account", async (req, res) => {
  const { Email, Token } = req.body;
  if (!Email || !Token) {
    return res.status(400).json({
      success: false,
      message: "Email and token are required",
    });
  }
  
  try {
    const formData = qs.stringify({
      Email: Email,
      "anti-csrftoken-a2z": Token
    });
    const response =await client.post("https://www.amazon.in/ax/claim?openid.ns=http%3A%2F%2Fspecs.openid.net%2Fauth%2F2.0&openid.return_to=https%3A%2F%2Fwww.amazon.in%2F%3F%26tag%3Dgooginhydr1-21%26ref%3Dnav_ya_signin%26adgrpid%3D171770161190%26hvpone%3D%26hvptwo%3D%26hvadid%3D714840681071%26hvpos%3D%26hvnetw%3Dg%26hvrand%3D14807682158325480337%26hvqmt%3De%26hvdev%3Dc%26hvdvcmdl%3D%26hvlocint%3D%26hvlocphy%3D9062203%26hvtargid%3Dkwd-3704926535%26hydadcr%3D18657_2389208%26mcid%3Da684625856e53b7aba1406fdfbcd950e%26gad_source%3D1&policy_handle=Retail-Checkout&openid.mode=checkid_setup&openid.assoc_handle=inflex&arb=afa6fd50-aa24-4f1f-a081-4210bdf7f26f",
      formData,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    const result = response.data;
    let message = "unknown";  
    if (result.includes("Sign in")){
      message ="account is found";
    }
    else if(result.includes("Looks like you are new to Amazon")){
      message = "account is not found";
    }
    res.json({
      success: true,
      result
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to login",
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

        const response2 = await axios.post(
          `https://lab.stealthmole.com/report/credentials?domain_id=${domainID}`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              Cookie: "C27297A778BF5D2DB517F08F36445AE5"
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

    app.get("/api/vahan", async (req, res) => {
      try {
        const response = await client.get(
          "https://vahan.parivahan.gov.in/nrservices/faces/user/citizen/citizenlogin.xhtml"
        );

        const $ = cheerio.load(response.data);

        const viewState = $('input[name="javax.faces.ViewState"]').val();
        const txtNumber = $('input[name="txtNumber"]').val();

        if (!viewState) {
          return res.status(500).json({
            success: false,
            message: "ViewState not found",
          });
        }

        // Get captcha with same session
        const captchaRes = await client.get(
          "https://vahan.parivahan.gov.in/nrservices/cap_img.jsp",
          { responseType: "arraybuffer" }
        );

        const captchaBase64 = Buffer.from(captchaRes.data).toString("base64");

        res.json({
          success: true,
          captchaBase64,
          viewState,
          txtNumber,
        });

      } catch (error) {
        console.log("CAPTCHA ERROR:", error.message);
        res.status(500).json({
          success: false,
          message: "Failed to load captcha",
        });
      }
    });

    /* ==========================================
       STEP 2 - LOGIN
    ========================================== */
    app.post("/api/login", async (req, res) => {
      try {
        const { mobile_no, captcha, viewState } = req.body;

        if (!mobile_no || !captcha || !viewState) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields",
          });
        }

        const formData = qs.stringify({
          masterLayout: "masterLayout",
          TfMOBILENO: mobile_no,
          txt_ALPHA_NUMERIC: captcha,
          btRtoLogin: "Next",
          "javax.faces.ViewState": viewState,
        });

        const loginResponse = await client.post(
          "https://vahan.parivahan.gov.in/nrservices/faces/user/citizen/citizenlogin.xhtml",
          formData,
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        let message = "unknown";
        const result = loginResponse.data;
        if (result.includes("Mobile number is not registered with NR Services Portal.")) {
          message = "user are not register";
        }
        else if (result.includes("password")) {
          message = "user are register"
        }

        res.json({
          success: true,
          message
        });

      } catch (error) {
        console.log("LOGIN ERROR:", error.response?.data || error.message);
        res.status(500).json({
          success: false,
          message: "Login failed",
        });
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