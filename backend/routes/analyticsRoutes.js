import express from "express";
import { getAdminAnalytics } from "../controllers/analyticsController.js";
import { protect, protectAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/admin", protect, protectAdmin, getAdminAnalytics);

export default router;
