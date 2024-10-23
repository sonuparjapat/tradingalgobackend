// Router.js (Main Router Logic)
const express = require("express");
const { SmartAPI } = require('smartapi-javascript');  // Correct import
const router = express.Router();
const jsondata = require("../data/response.json");  // Instrument data (response.json)

var axios = require('axios');

let smart_api = null;
let accessToken = '';  // Access token stored globally in memory

// Login route to generate the login URL
router.get("/login", (req, res) => {
    smart_api = new SmartAPI({
        api_key: process.env.API_KEY  // Your Angel One API key from .env
    });

    // Log the smart_api object to inspect its methods (optional)


    const loginUrl = smart_api.getLoginURL({
        redirect_uri: "https://tradingalgobackend.onrender.com/main/callback"  // Set the callback URL
    });  // Use the correct method to get login URL
    res.redirect(loginUrl); // Redirect user to login page
});

// Callback route to capture the access token after login
router.get('/callback', async (req, res) => {
    accessToken = req.query.auth_token;  // Capture access token from query parameters

    if (!accessToken) {
        return res.status(400).send('Access token not provided.');
    }

    // Initialize SmartAPI client with access token
    smart_api = new SmartAPI({
        api_key: process.env.API_KEY,
        access_token: accessToken
    });

    res.send('Login successful! You can now access trading functionalities.');
});

// Function to get instrument token from response.json
const getInstrumentToken = (tradingsymbol) => {
    const instrument = jsondata.find(item => item.symbol === tradingsymbol);
    if (instrument) {
        return instrument.token;  // Return the token directly
    } else {
        console.log(`Token not found for ${tradingsymbol}`);
        throw new Error(`Token not found for ${tradingsymbol}`);  // Throw an error if not found
    }
};

// Middleware to check if user is authenticated (i.e., access token is available)
const checkTokenExpiry = (req, res, next) => {
    if (!accessToken) {
        return res.status(401).json({ message: 'Token expired or not available, please log in again.' });
    }
    next();  // Token is valid, proceed to the next middleware/route
};

// /quote route: Fetch market data for a stock

const getPublicIP = async () => {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;  // Returns your public IP address as a string
    } catch (error) {
      console.error('Error fetching public IP:', error);
      return null;  // Return null if there was an error
    }
  };
  const getClientInfo = async () => {
    return {
        localIP: smart_api.local_ip, // Replace with actual IP fetching method
        publicIP: await getPublicIP(), // Fetch public IP dynamically using getPublicIP
        macAddress: smart_api.mac_addr // You can use the value from the smart_api object or fetch it dynamically
    };
};
router.get('/quote', checkTokenExpiry, async (req, res) => {
    const tradingsymbol = req.query.symbol || 'GULPOLY';  // Default to GULPOLY if no symbol is provided

    // Log client data from smart_api object
  console.log(smart_api,"smart api data is coming")

    // You can still use `getClientInfo` to fetch public IP if needed
    const clientInfo = await getClientInfo();

    try {
        // Fetch instrument token for the given symbol
        const token = getInstrumentToken(tradingsymbol);  // Synchronous call since jsondata is already loaded

        // Fetch the quote for the stock
        // const quote = await smart_api.getQuote({
        //     exchange: 'NSE',  // Assuming NSE
        //     tradingsymbol: tradingsymbol,
        //     token: token  // Dynamically fetched token
        // });

        // Send the quote data along with client data as a response
        var data = JSON.stringify({
            "mode": "FULL",
            "exchangeTokens": {
                "NSE": ["3045"]
            }
        });
        const config = {
            method: 'post',
            url: 'https://apiconnect.angelone.in/rest/secure/angelbroking/market/v1/quote/',
            headers: { 
                'X-PrivateKey': process.env.API_KEY,  // Replace with your actual API key
                'Accept': 'application/json, application/json',
                'X-SourceID': 'WEB, WEB',  // Assuming this is correct from the Angel API docs
                'X-ClientLocalIP': clientInfo.localIP,  // Client local IP address
                'X-ClientPublicIP': clientInfo.publicIP,  // Client public IP address
                'X-MACAddress': clientInfo.macAddress,  // Client MAC address
                'X-UserType': 'USER',  // User type for Angel API
                'Authorization': `Bearer ${accessToken}`,  // Bearer token for authorization
                'Content-Type': 'application/json'
            },
            data: data
        };

        // Make the Axios request
        const response = await axios(config);
        res.status(200).json({data:response})
        
    } catch (err) {
        console.error("Error fetching quote:", err);
        res.status(500).send('Error fetching quote: ' + err.message);  // Return the error message
    }
});
router.get('/marketData',checkTokenExpiry, async (req, res) => {
    const tradingsymbol = req.query.symbol || 'GULPOLY';  
    const token = getInstrumentToken(tradingsymbol);
console.log(token,"token coming fine")
    // Default symbol
    console.log(smart_api,"smart_api")
    try {
        const marketData = await smart_api.marketData({ 
            exchange: 'NSE', 
            tradingsymbol: tradingsymbol,
            token: token
        });
        console.log(marketData,"markeet data coming")

        res.json(marketData);
    } catch (err) {
        console.error("Error fetching market data:", err);
        res.status(500).send('Error fetching market data: ' + err.message);
    }
});
// /quotes route: Fetch multiple stock quotes at once
router.get('/quotes', async (req, res) => {
    const symbols = req.query.symbols ? req.query.symbols.split(',') : ['GULPOLY', 'TCS'];  // List of symbols
    
    try {
        const tokens = symbols.map(symbol => getInstrumentToken(symbol));  // Fetch tokens for each symbol
console.log(smart_api,"smartapi")
        const quotes = await Promise.all(tokens.map(async (token, index) => {
            return await smart_api.getQuote({
                exchange: 'NSE',
                tradingsymbol: symbols[index],
                token: token
            });
        }));

        res.json(quotes);  // Send all quotes back to the client
    } catch (err) {
        console.error("Error fetching quotes:", err);
        res.status(500).send('Error fetching quotes: ' + err.message);
    }
});

module.exports = router;