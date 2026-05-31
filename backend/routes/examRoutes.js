import express from "express";

import {
  createExam,
  getExam,
  getExamById,
  submitExam,
  seedExams,
  removeSeededExams,
  assignExamToStudents,
  getStudentExams,
  getExamForStudent,
  autosaveDraft,
  getDraft,
  updateExam,
  deleteExam,
} from "../controllers/examController.js";

import {
  protect,
  protectAdmin,
  protectAdminOrProctor,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Get Assigned Student Exams
router.get("/student", protect, getStudentExams);

// Assign Exam
router.post(
  "/assign",
  protect,
  protectAdminOrProctor,
  assignExamToStudents
);
// Create Exam
router.post("/", protect, protectAdminOrProctor, createExam);

// Seed sample exams (admin only)
router.post("/seed", protect, protectAdmin, seedExams);

// Remove seeded sample exams (admin only)
router.delete("/seed", protect, protectAdmin, removeSeededExams);


// Get All Exams
router.get("/", protect, getExam);

// Submit Exam
router.post("/submit", protect, submitExam);

router.get("/:id/take", protect, getExamForStudent);
router.post("/:id/autosave", protect, autosaveDraft);
router.get("/:id/draft", protect, getDraft);
// Get Single Exam (admin/proctor full view)
router.get("/:id", protect, getExamById);

// Update Exam (admin/proctor only)
router.put("/:id", protect, protectAdminOrProctor, updateExam);

// Delete Exam (admin/proctor only)
router.delete("/:id", protect, protectAdminOrProctor, deleteExam);

export default router;