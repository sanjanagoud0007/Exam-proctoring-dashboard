import express from "express";
import {
  startSession,
  endSession,
  getActiveSessions,
} from "../controllers/sessionController.js";
import {
  protect,
  protectAdminOrProctor,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startSession);
router.post("/end", protect, endSession);
router.get(
  "/active",
  protect,
  protectAdminOrProctor,
  getActiveSessions
);

export default router;
