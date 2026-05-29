import express from "express";
import User from "../models/UserModel.js";
import {
  protect,
  protectAdmin,
  protectAdminOrProctor,
} from "../middleware/authMiddleware.js";
import {
  createUser,
  deleteUser,
  banUser,
  listProctors,
} from "../controllers/userController.js";

const router = express.Router();

router.get(
  "/students",
  protect,
  protectAdminOrProctor,
  async (req, res) => {
    try {
      const students = await User.find({ role: "student" }).select("-password");
      res.json(students);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

router.get("/proctors", protect, protectAdmin, listProctors);

router.post("/", protect, protectAdmin, createUser);
router.delete("/:id", protect, protectAdmin, deleteUser);
router.put("/:id/ban", protect, protectAdmin, banUser);

export default router;