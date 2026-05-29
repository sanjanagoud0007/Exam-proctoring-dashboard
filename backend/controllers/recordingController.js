import ScreenRecording from "../models/ScreenRecordingModel.js";

export const saveRecordingChunk = async (req, res) => {
  try {
    const { examId, chunk, mimeType, durationMs } = req.body;

    let recording = await ScreenRecording.findOne({
      studentId: req.user._id,
      examId,
    });

    if (!recording) {
      recording = await ScreenRecording.create({
        studentId: req.user._id,
        examId,
        chunks: chunk ? [chunk] : [],
        mimeType,
        durationMs,
      });
    } else if (chunk) {
      recording.chunks.push(chunk);
      if (durationMs) recording.durationMs = durationMs;
      await recording.save();
    }

    res.json({ ok: true, chunkCount: recording.chunks.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecordings = async (req, res) => {
  try {
    const { examId, studentId } = req.query;
    const filter = {};
    if (examId) filter.examId = examId;
    if (studentId) filter.studentId = studentId;

    const recordings = await ScreenRecording.find(filter)
      .populate("studentId", "name email")
      .populate("examId", "title")
      .select("-chunks")
      .sort({ createdAt: -1 });

    res.json(recordings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecordingById = async (req, res) => {
  try {
    const recording = await ScreenRecording.findById(req.params.id)
      .populate("studentId", "name email")
      .populate("examId", "title");

    if (!recording) {
      return res.status(404).json({ message: "Recording not found" });
    }

    res.json(recording);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
