import User from "../models/UserModel.js";
import Exam from "../models/ExamModel.js";
import Attempt from "../models/AttemptModel.js";
import ProctorLog from "../models/ProctorLogModel.js";
import ExamSession from "../models/ExamSessionModel.js";

export const getAdminAnalytics = async (req, res) => {
  try {
    const [
      totalStudents,
      totalProctors,
      totalExams,
      totalAttempts,
      totalViolations,
      activeSessions,
      attempts,
      violationByType,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "proctor" }),
      Exam.countDocuments(),
      Attempt.countDocuments(),
      ProctorLog.countDocuments(),
      ExamSession.countDocuments({ status: "active" }),
      Attempt.find().populate("examId", "title").populate("studentId", "name"),
      ProctorLog.aggregate([
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
      ]),
    ]);

    const passed = attempts.filter((a) => {
      const max = a.examId?.questions?.length || 1;
      return a.score >= max * 0.4;
    }).length;

    const passFailRatio = {
      pass: passed,
      fail: attempts.length - passed,
    };

    const averageScore =
      attempts.length > 0
        ? attempts.reduce((s, a) => s + a.score, 0) / attempts.length
        : 0;

    res.json({
      totalStudents,
      totalProctors,
      totalExams,
      examsConducted: totalAttempts,
      totalViolations,
      activeSessions,
      averageViolations:
        totalAttempts > 0
          ? Number((totalViolations / totalAttempts).toFixed(2))
          : 0,
      passFailRatio,
      averageScore: Number(averageScore.toFixed(2)),
      violationHeatmap: violationByType,
      recentAttempts: attempts.slice(0, 20),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
