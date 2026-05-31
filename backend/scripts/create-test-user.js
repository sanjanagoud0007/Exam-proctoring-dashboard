import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/UserModel.js";

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(async () => {
    console.log("Connected to MongoDB");
    const email = "sanjanagoud0007@gmail.com";
    
    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("User already exists:", existing);
      process.exit(0);
    }

    const user = await User.create({
      name: "Sanjana Goud",
      email: email,
      password: "Password123", // UserModel will hash it automatically on save
      role: "admin",
      approved: true,
    });
    console.log("Test user created successfully:", user);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
