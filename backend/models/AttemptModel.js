import mongoose from "mongoose";

const attemptSchema = mongoose.Schema(
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

    answers: [String],

    score: {
      type: Number,
      default: 0,
    },

    startTime: {
      type: Date,
      default: Date.now,
    },

    endTime: Date,

    cheatingScore: { type: Number, default: 0 },
    riskLevel: {
      type: String,
      enum: ["Low Risk", "Medium Risk", "High Risk"],
      default: "Low Risk",
    },
    submitReason: {
      type: String,
      default: "manual",
    },
    questionOrder: [Number],
    timePerQuestion: mongoose.Schema.Types.Mixed,
    durationSeconds: Number,
    attendanceVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

attemptSchema.index({ studentId: 1, examId: 1 }, { unique: true });

const Attempt = mongoose.model(
  "Attempt",
  attemptSchema
);

export default Attempt;