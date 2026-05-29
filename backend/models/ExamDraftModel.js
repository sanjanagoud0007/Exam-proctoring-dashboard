import mongoose from "mongoose";

const examDraftSchema = mongoose.Schema(
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
    questionOrder: [Number],
    timePerQuestion: mongoose.Schema.Types.Mixed,
    startedAt: Date,
  },
  { timestamps: true }
);

examDraftSchema.index({ studentId: 1, examId: 1 }, { unique: true });

export default mongoose.model("ExamDraft", examDraftSchema);
