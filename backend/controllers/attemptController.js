import Attempt from "../models/AttemptModel.js";
import ProctorLog from "../models/ProctorLogModel.js";

export const getAttempts = async (req, res) => {
  try {
    const attempts = await Attempt.find({
      studentId: req.user._id,
    }).populate("examId", "title duration");

    res.json(attempts);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getExamAnalytics = async (req, res) => {
  try {
    const { examId } = req.query;

    const attemptFilter = examId ? { examId } : {};
    const logFilter = examId ? { examId } : {};

    const [attempts, violationLogs] = await Promise.all([
      Attempt.find(attemptFilter)
        .populate("studentId", "name email")
        .populate("examId", "title duration questions")
        .sort({ createdAt: -1 }),
      ProctorLog.find(logFilter)
        .populate("studentId", "name email")
        .populate("examId", "title")
        .sort({ timestamp: -1 })
        .limit(200),
    ]);

    const totalAttempts = attempts.length;
    const averageScore =
      totalAttempts > 0
        ? attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
        : 0;

    const scoresByExam = {};
    attempts.forEach((attempt) => {
      const key = attempt.examId?._id?.toString() || "unknown";
      if (!scoresByExam[key]) {
        scoresByExam[key] = {
          examId: key,
          title: attempt.examId?.title || "Unknown exam",
          attempts: 0,
          totalScore: 0,
          maxScore: attempt.examId?.questions?.length || 0,
        };
      }
      scoresByExam[key].attempts += 1;
      scoresByExam[key].totalScore += attempt.score;
    });

    const examSummaries = Object.values(scoresByExam).map((row) => ({
      ...row,
      averageScore:
        row.attempts > 0
          ? Number((row.totalScore / row.attempts).toFixed(2))
          : 0,
    }));

    res.json({
      summary: {
        totalAttempts,
        averageScore: Number(averageScore.toFixed(2)),
        totalViolations: violationLogs.length,
      },
      attempts,
      violationLogs,
      examSummaries,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
