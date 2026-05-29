import ProctorLog from "../models/ProctorLogModel.js";
import Exam from "../models/ExamModel.js";
import User from "../models/UserModel.js";
import ExamSession from "../models/ExamSessionModel.js";
import { VIOLATION_SCORES } from "../utils/cheatingScore.js";
import { sendWarningAlertEmail } from "../services/notificationService.js";

export const createLog = async (req, res) => {
  const {
    studentId,
    examId,
    timestamp,
    eventType,
    description,
    student,
    exam,
    type,
    message,
  } = req.body;

  const resolvedType = eventType || type;
  const score = VIOLATION_SCORES[resolvedType] || 5;

  const log = await ProctorLog.create({
    studentId: studentId || student || req.user?._id,
    examId: examId || exam,
    timestamp: timestamp || Date.now(),
    eventType: resolvedType,
    description: description || message,
    score,
  });

  await ExamSession.findOneAndUpdate(
    {
      studentId: log.studentId,
      examId: log.examId,
      status: "active",
    },
    { $inc: { warnings: 1, cheatingScore: score } }
  );

  try {
    const [studentDoc, examDoc] = await Promise.all([
      User.findById(log.studentId),
      Exam.findById(log.examId),
    ]);
    if (studentDoc && examDoc) {
      await sendWarningAlertEmail(studentDoc, examDoc, resolvedType);
    }
  } catch (e) {
    console.warn("Warning email failed", e.message);
  }

  res.status(201).json(log);
};

export const getLogs = async (req, res) => {
  const logs = await ProctorLog.find();
  res.json(logs);
};