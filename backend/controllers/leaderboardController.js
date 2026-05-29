import Attempt from "../models/AttemptModel.js";

export const getLeaderboard = async (req, res) => {
  try {
    const { examId } = req.query;
    const filter = examId ? { examId } : {};

    const attempts = await Attempt.find(filter)
      .populate("studentId", "name email")
      .populate("examId", "title duration questions")
      .sort({ score: -1, durationSeconds: 1, createdAt: 1 })
      .limit(50);

    const ranked = attempts.map((a, index) => ({
      rank: index + 1,
      studentName: a.studentId?.name,
      studentEmail: a.studentId?.email,
      examTitle: a.examId?.title,
      score: a.score,
      maxScore: a.examId?.questions?.length || 0,
      durationSeconds: a.durationSeconds,
      riskLevel: a.riskLevel,
      cheatingScore: a.cheatingScore,
      completedAt: a.endTime || a.createdAt,
    }));

    res.json(ranked);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
