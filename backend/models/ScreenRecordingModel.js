import mongoose from "mongoose";

const screenRecordingSchema = mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    chunks: [String],
    mimeType: { type: String, default: "video/webm" },
    durationMs: Number,
  },
  { timestamps: true }
);

export default mongoose.model("ScreenRecording", screenRecordingSchema);
