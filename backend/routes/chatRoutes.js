import express from "express";
import {
  getChatMessages,
  postChatMessage,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:examId", protect, getChatMessages);
router.post("/:examId", protect, postChatMessage);

export default router;
