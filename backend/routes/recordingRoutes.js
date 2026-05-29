import express from "express";
import {
  saveRecordingChunk,
  getRecordings,
  getRecordingById,
} from "../controllers/recordingController.js";
import {
  protect,
  protectAdminOrProctor,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chunk", protect, saveRecordingChunk);
router.get("/", protect, protectAdminOrProctor, getRecordings);
router.get("/:id", protect, protectAdminOrProctor, getRecordingById);

export default router;
