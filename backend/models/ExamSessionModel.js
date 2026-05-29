import mongoose from "mongoose";

const examSessionSchema = mongoose.Schema(
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
    status: {
      type: String,
      enum: ["active", "completed", "terminated"],
      default: "active",
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: Date,
    lastWebcamFrame: String,
    warnings: { type: Number, default: 0 },
    cheatingScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("ExamSession", examSessionSchema);
