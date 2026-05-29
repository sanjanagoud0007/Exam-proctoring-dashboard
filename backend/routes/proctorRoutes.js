import express from "express";
import { createLog, getLogs } from "../controllers/proctorController.js";
import {
  protect,
  protectAdminOrProctor,
} from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createLog).get(protect, protectAdminOrProctor, getLogs);

export default router;
