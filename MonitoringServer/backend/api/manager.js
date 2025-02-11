const express = require("express");
const router = express.Router();

// Hardcoded username and password
const config = require("../config");

const SUPER_USERNAME = config.SUPER_USERNAME;
const SUPER_PASSWORD = config.SUPER_PASSWORD;

// Login route
router.post("/", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  // Compare with hardcoded credentials
  if (username === SUPER_USERNAME && password === SUPER_PASSWORD) {
    return res.status(200).json({ message: "Login successful!" });
  } else {
    return res.status(401).json({ message: "Invalid username or password." });
  }
});

module.exports = router;
