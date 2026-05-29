import express from "express";
import {
  loginUser,
  registerUser,
  getUserProfile,
  getUsers,
  approveUser,
  updateUserRole,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateProfile,
} from "../controllers/authController.js";
import {
  protect,
  protectAdmin,
  protectAdminOrProctor,
} from "../middleware/authMiddleware.js";
import { authRateLimiter } from "../middleware/authRateLimiter.js";

const router = express.Router();

router.post("/register", authRateLimiter, registerUser);
router.post("/login", authRateLimiter, loginUser);
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/verify-otp", authRateLimiter, verifyOtp);
router.post("/reset-password", authRateLimiter, resetPassword);
router.put("/profile", protect, updateProfile);
router.get("/profile", protect, getUserProfile);
router.get("/users", protect, protectAdminOrProctor, getUsers);
router.put("/user/:id/approve", protect, protectAdminOrProctor, approveUser);
router.put("/user/:id/role", protect, protectAdmin, updateUserRole);

export default router;