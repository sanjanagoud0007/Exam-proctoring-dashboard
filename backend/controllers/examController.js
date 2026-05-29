import Exam from "../models/ExamModel.js";
import Attempt from "../models/AttemptModel.js";
import ExamDraft from "../models/ExamDraftModel.js";
import ProctorLog from "../models/ProctorLogModel.js";
import User from "../models/UserModel.js";
import { buildStudentExam } from "../utils/shuffleExam.js";
import { calculateExamScore } from "../utils/scoreExam.js";
import {
  calculateCheatingScore,
  VIOLATION_SCORES,
} from "../utils/cheatingScore.js";
import {
  sendExamAssignedEmail,
  sendResultPublishedEmail,
} from "../services/notificationService.js";


// ================= CREATE EXAM =================

export const createExam = async (req, res) => {
  try {
    const {
      title,
      duration,
      questions,
      instructions,
      negativeMarking,
      negativeMarkValue,
      startTime,
      endTime,
      maxViolations,
    } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Exam title is required" });
    }

    if (!questions?.length) {
      return res.status(400).json({ message: "At least one question is required" });
    }

    const exam = await Exam.create({
      title: title.trim(),
      duration: Number(duration) || 30,
      questions,
      instructions: instructions || "",
      negativeMarking: Boolean(negativeMarking),
      negativeMarkValue: Number(negativeMarkValue) || 0.25,
      maxViolations: Number(maxViolations) || 4,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      createdBy: req.user._id,
      status: "upcoming",
    });

    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ================= GET ALL EXAMS =================

export const getExam = async (req, res) => {
  try {

    const exams = await Exam.find()
      .populate("assignedStudents", "name email");

    res.json(exams);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// ================= GET SINGLE EXAM =================

export const getExamById = async (req, res) => {
  try {

    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    res.json(exam);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// ================= SUBMIT EXAM =================

export const submitExam = async (req, res) => {
  try {
    const { examId, answers } = req.body;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const assigned = exam.assignedStudents?.some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (req.user.role === "student" && !assigned) {
      return res.status(403).json({ message: "Exam not assigned to you" });
    }

    const existing = await Attempt.findOne({
      studentId: req.user._id,
      examId,
    });
    if (existing) {
      return res.status(400).json({
        message: "Exam already submitted",
        score: existing.score,
        attempt: existing,
      });
    }

    const order = req.body.questionOrder;
    const { score, maxScore, mcqCorrect, mcqTotal } = calculateExamScore(
      exam,
      answers,
      order
    );

    const logs = await ProctorLog.find({
      studentId: req.user._id,
      examId,
    });
    const eventTypes = logs.map((l) => l.eventType);
    const { cheatingScore, riskLevel } =
      calculateCheatingScore(eventTypes);

    const attempt = await Attempt.create({
      studentId: req.user._id,
      examId,
      answers,
      score,
      startTime: req.body.startTime || Date.now(),
      endTime: req.body.endTime || new Date(),
      cheatingScore,
      riskLevel,
      submitReason: req.body.submitReason || "manual",
      questionOrder: req.body.questionOrder,
      timePerQuestion: req.body.timePerQuestion,
      durationSeconds: req.body.durationSeconds,
      attendanceVerified: req.body.attendanceVerified ?? true,
    });

    await ExamDraft.deleteOne({
      studentId: req.user._id,
      examId,
    });

    try {
      await sendResultPublishedEmail(req.user, exam, attempt);
    } catch (e) {
      console.warn("Result email failed", e.message);
    }

    res.status(201).json({
      message: "Exam submitted successfully",
      score,
      maxScore,
      mcqCorrect,
      mcqTotal,
      cheatingScore,
      riskLevel,
      attempt,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// ================= ASSIGN EXAM =================

export const assignExamToStudents = async (
  req,
  res
) => {
  try {

    const { examId, studentIds } = req.body;

    if (!examId) {
      return res.status(400).json({ message: "Exam ID is required" });
    }

    const ids = Array.isArray(studentIds)
      ? studentIds.filter(Boolean)
      : studentIds
        ? [studentIds]
        : [];

    if (ids.length === 0) {
      return res.status(400).json({
        message: "Select at least one student",
      });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found",
      });
    }

    exam.assignedStudents = ids;
    exam.status = "active";
    await exam.save();

    const students = await User.find({ _id: { $in: ids } });
    for (const student of students) {
      try {
        await sendExamAssignedEmail(student, exam);
      } catch (e) {
        console.warn("Assign email failed", e.message);
      }
    }

    res.json({
      message: `Exam assigned to ${ids.length} student(s)`,
      assignedCount: ids.length,
      exam,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// ================= GET STUDENT EXAMS =================

export const getStudentExams = async (
  req,
  res
) => {
  try {

    const exams = await Exam.find({
      assignedStudents: req.user._id,
    });

    res.json(exams);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// ================= SEED EXAMS =================

export const seedExams = async (req, res) => {

  if (process.env.ALLOW_SEED !== "true") {
    return res.status(403).json({
      message:
        "Seeding disabled. Set ALLOW_SEED=true",
    });
  }

  try {

    const existing =
      await Exam.countDocuments();

    if (existing > 0) {
      return res.status(400).json({
        message: "Exams already exist",
      });
    }

    const samples = [
      {
        title: "JavaScript Fundamentals",
        duration: 30,

        questions: [
          {
            question:
              "What is closure?",

            options: ["A", "B", "C"],

            correctAnswer: "A",
          },
        ],
      },

      {
        title: "Node.js Basics",

        duration: 25,

        questions: [
          {
            question:
              "What is npm?",

            options: ["A", "B", "C"],

            correctAnswer: "A",
          },
        ],
      },
    ];

    const created = await Exam.create(
      samples.map((exam) => ({
        ...exam,
        createdBy: req.user._id,
        seeded: true,
      }))
    );

    res.status(201).json(created);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};


// ================= REMOVE SEEDED EXAMS =================

export const removeSeededExams = async (
  req,
  res
) => {

  if (process.env.ALLOW_SEED !== "true") {
    return res.status(403).json({
      message:
        "Seeding disabled. Set ALLOW_SEED=true",
    });
  }

  try {

    const result =
      await Exam.deleteMany({
        seeded: true,
      });

    res.json({
      deletedCount:
        result.deletedCount,
    });

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }
};

export const getExamForStudent = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const assigned = exam.assignedStudents?.some(
      (id) => id.toString() === req.user._id.toString()
    );
    if (req.user.role === "student" && !assigned) {
      return res.status(403).json({ message: "Exam not assigned to you" });
    }

    const shuffled = buildStudentExam(exam, req.user._id);
    res.json({
      ...shuffled,
      instructions: exam.instructions,
      negativeMarking: exam.negativeMarking,
      maxViolations: exam.maxViolations,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const autosaveDraft = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, questionOrder, timePerQuestion, startedAt } =
      req.body;

    const draft = await ExamDraft.findOneAndUpdate(
      { studentId: req.user._id, examId: id },
      {
        answers,
        questionOrder,
        timePerQuestion,
        startedAt: startedAt || new Date(),
      },
      { upsert: true, new: true }
    );

    res.json(draft);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDraft = async (req, res) => {
  try {
    const draft = await ExamDraft.findOne({
      studentId: req.user._id,
      examId: req.params.id,
    });
    res.json(draft || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verifyAttendance = async (req, res) => {
  try {
    const { faceMatchScore } = req.body;
    const verified = faceMatchScore >= 0.45;
    res.json({
      verified,
      faceMatchScore,
      message: verified
        ? "Attendance verified"
        : "Face does not match profile. Try again with better lighting.",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};