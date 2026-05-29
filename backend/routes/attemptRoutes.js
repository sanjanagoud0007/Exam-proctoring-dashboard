import express from "express";

import {
  getAttempts,
  getExamAnalytics,
} from "../controllers/attemptController.js";

import {
  protect,
  protectAdminOrProctor,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getAttempts);

router.get(
  "/analytics",
  protect,
  protectAdminOrProctor,
  getExamAnalytics
);

export default router;
