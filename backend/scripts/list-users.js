import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/UserModel.js";

const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri)
  .then(async () => {
    console.log("Connected to MongoDB");
    const users = await User.find({}).select("name email role approved");
    console.log("Users in Database:");
    console.log(users);
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
