const express = require('express');
const cors = require('cors');
const SmartAPI = require('smartapi-javascript');
const router = require('./Routers/Router');
require('dotenv').config();
const app = express();
app.use(cors());  // Enable CORS
app.use("/main",router)
// Serve on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});