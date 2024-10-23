const express = require("express");
const axios = require("axios");
const router = express.Router();
const getClientInfo=require("../data/Utility/clientInfo")
const jsondata = require("../data/response.json");
const { getClientInfo } = require("../data/Utility/clientInfo");

let accessToken = '';  // Access token stored globally

// Helper function to fetch real-time IP addresses


// Middleware to check token
const checkTokenExpiry = (req, res, next) => {
  if (!accessToken) {
    return res.status(401).json({ message: 'Please log in.' });
  }
  next();
};

// Get login URL
router.get("/login", (req, res) => {
  const loginUrl = `https://smartapi.angelone.in/login?api_key=${process.env.API_KEY}&redirect_uri=https://tradingalgobackend.onrender.com/main/callback`;
  res.redirect(loginUrl);
});

// Callback route
router.get("/callback", (req, res) => {
  accessToken = req.query.auth_token;
  res.send("Login successful!");
});

// Fetch quote using Angel One API
router.get("/quote", checkTokenExpiry, async (req, res) => {
  const tradingsymbol = req.query.symbol || 'GULPOLY';
  const token = jsondata.find(item => item.symbol === tradingsymbol)?.token;

  if (!token) {
    return res.status(404).json({ message: "Token not found." });
  }

  const clientInfo = await getClientInfo();
  try {
    const { localIP, publicIP, macAddress } = clientInfo;
    console.log(localIP,publicIP,macAddress,"ip addres coming")
    const config = {
      method: 'post',
      url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/market/v1/quote/',
      headers: {
        'X-PrivateKey': process.env.API_KEY,
        'Authorization': `Bearer ${accessToken}`,
        'X-ClientLocalIP': localIP,
        'X-ClientPublicIP': publicIP,
        'X-MACAddress': macAddress,
        'X-SourceID': 'WEB',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      data: JSON.stringify({
        "mode": "FULL",
        "exchangeTokens": { "NSE": [token] }
      })
    };

    const response = await axios(config);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching quote:", error);
    res.status(500).send("Error fetching quote.");
  }
});

module.exports = router;