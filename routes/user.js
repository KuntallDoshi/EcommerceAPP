const express = require("express");
const asyncHandler = require("express-async-handler");
const router = express.Router();
const User = require("../model/user");
const OTP = require("../model/otpRegister");
const axios = require("axios");
const https = require("https");
require("dotenv").config();
const UserVerification = require("../model/userVerification");

// ✅ SEND OTP API
router.post("/send-otp", async (req, res) => {
  try {
    const { mobile } = req.body;
    if (!mobile)
      return res.status(400).json({ message: "Mobile number is required" });

    const otp = Math.floor(100000 + Math.random() * 900000); // Generate 6-digit OTP
    console.log(`Generated OTP for ${mobile}: ${otp}`); // Debug OTP

    // ✅ Store OTP in MongoDB (Replace existing if any)
    await OTP.findOneAndUpdate(
      { mobile },
      { otp, createdAt: new Date() },
      { upsert: true }
    );

    // ✅ Construct SMS API URL
    const smsApiUrl = `${process.env.SMS_API_URL}?username=${process.env.SMS_USERNAME}&apikey=${process.env.SMS_APIKEY}&senderid=${process.env.SMS_SENDERID}&route=${process.env.SMS_ROUTE}&mobile=${mobile}&text=Your verification code is ${otp} for https://bhatiamobile.com`;

    const agent = new https.Agent({ rejectUnauthorized: false });
    const response = await axios.get(smsApiUrl, { httpsAgent: agent });

    console.log("SMS API Response:", response.data); // Debug API response

    if (response.data.includes("Failed") || response.data.includes("error")) {
      return res
        .status(500)
        .json({ message: "SMS API Error", details: response.data });
    }

    res.json({ message: "OTP sent successfully", mobile });
  } catch (error) {
    console.error("Error sending OTP:", error.message);
    res
      .status(500)
      .json({ message: "Failed to send OTP", error: error.message });
  }
});
// ✅ VERIFY OTP API (Without JWT)
router.post("/verify-otp", async (req, res) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({ message: "Mobile and OTP are required" });
    }

    const record = await OTP.findOne({ mobile });
    if (!record) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ OTP is correct, delete it from the database
    await OTP.deleteOne({ mobile });

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error.message);
    res
      .status(500)
      .json({ message: "Failed to verify OTP", error: error.message });
  }
});

// Get all users
router.get(
  "/",
  asyncHandler(async (req, res) => {
    try {
      const users = await User.find();
      res.json({
        success: true,
        message: "Users retrieved successfully.",
        data: users,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }
    // Check if the password is correct
    if (user.password !== password) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    // Authentication successful
    res
      .status(200)
      .json({ success: true, message: "Login successful.", data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get a user by ID
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    try {
      const userID = req.params.id;
      const user = await User.findById(userID);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }
      res.json({
        success: true,
        message: "User retrieved successfully.",
        data: user,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Create a new user
router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!email || !name || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Name, and password are required." });
    }
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    try {
      const user = new User({ email, name, password });
      const newUser = await user.save().then((result) => {});
      res.json({
        success: true,
        message: "User created successfully.",
        data: newUser,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Update a user
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    try {
      const userID = req.params.id;
      const { name, password } = req.body;
      if (!name || !password) {
        return res.status(400).json({
          success: false,
          message: "Name,  and password are required.",
        });
      }

      const updatedUser = await User.findByIdAndUpdate(
        userID,
        { name, password },
        { new: true }
      );

      if (!updatedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }

      res.json({
        success: true,
        message: "User updated successfully.",
        data: updatedUser,
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

// Delete a user
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    try {
      const userID = req.params.id;
      const deletedUser = await User.findByIdAndDelete(userID);
      if (!deletedUser) {
        return res
          .status(404)
          .json({ success: false, message: "User not found." });
      }
      res.json({ success: true, message: "User deleted successfully." });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  })
);

module.exports = router;
