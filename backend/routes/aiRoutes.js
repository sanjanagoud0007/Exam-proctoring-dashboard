import express from "express";
import { generateQuestions } from "../controllers/aiController.js";
import {
  protect,
  protectAdminOrProctor,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post(
  "/generate-questions",
  protect,
  protectAdminOrProctor,
  generateQuestions
);

export default router;
