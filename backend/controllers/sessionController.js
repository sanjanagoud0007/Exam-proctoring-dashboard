import ExamSession from "../models/ExamSessionModel.js";

export const startSession = async (req, res) => {
  try {
    const { examId } = req.body;
    const existing = await ExamSession.findOne({
      studentId: req.user._id,
      examId,
      status: "active",
    });

    if (existing) {
      return res.json(existing);
    }

    const session = await ExamSession.create({
      studentId: req.user._id,
      examId,
      status: "active",
    });

    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const endSession = async (req, res) => {
  try {
    const { examId } = req.body;
    const session = await ExamSession.findOneAndUpdate(
      { studentId: req.user._id, examId, status: "active" },
      { status: "completed", endedAt: new Date() },
      { new: true }
    );
    res.json(session || { message: "No active session" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getActiveSessions = async (req, res) => {
  try {
    const sessions = await ExamSession.find({ status: "active" })
      .populate("studentId", "name email")
      .populate("examId", "title duration")
      .sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
