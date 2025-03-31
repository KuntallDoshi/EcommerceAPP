const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Auto-delete after 5 min
});

module.exports = mongoose.model("OTP", otpSchema);
