import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Otp from "../models/OtpModel.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(async () => {
    console.log("Connected to MongoDB");
    const email = "sanjanagoud0007@gmail.com";

    // 1. Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.error("Test user not found in database!");
      process.exit(1);
    }

    // 2. Generate secure 6-digit OTP (simulate forgotPassword)
    console.log("Generating OTP...");
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    await Otp.findOneAndUpdate(
      { email },
      {
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        attempts: 0,
      },
      { upsert: true, new: true }
    );
    console.log("OTP record created/updated. Code is:", otp);

    // 3. Verify OTP (simulate verifyOtp)
    console.log("Verifying OTP...");
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      console.error("OTP record not found!");
      process.exit(1);
    }

    const hashed = crypto.createHash("sha256").update(otp).digest("hex");
    if (otpRecord.otpHash !== hashed) {
      console.error("OTP hashes do not match!");
      process.exit(1);
    }

    // Generate JWT reset token
    const resetToken = jwt.sign(
      { email, purpose: "password_reset" },
      process.env.JWT_SECRET,
      { expiresIn: "10m" }
    );
    console.log("OTP verified successfully. Reset token generated.");

    // Delete OTP record
    await Otp.deleteOne({ email });

    // 4. Reset password (simulate resetPassword)
    console.log("Resetting password...");
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      console.error("Token verification failed:", err);
      process.exit(1);
    }

    if (decoded.purpose !== "password_reset") {
      console.error("Invalid token purpose!");
      process.exit(1);
    }

    const userToUpdate = await User.findOne({ email: decoded.email });
    if (!userToUpdate) {
      console.error("User to update not found!");
      process.exit(1);
    }

    userToUpdate.password = "NewPassword123";
    await userToUpdate.save();
    console.log("Password reset successfully! Flow is fully functional.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
