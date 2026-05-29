import mongoose from "mongoose";

const proctorLogSchema = mongoose.Schema(
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
    timestamp: {
      type: Date,
      default: Date.now,
    },
    eventType: {
      type: String,
      required: true,
    },
    description: String,
    score: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const ProctorLog = mongoose.model("ProctorLog", proctorLogSchema);
export default ProctorLog;