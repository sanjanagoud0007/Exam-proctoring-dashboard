import mongoose from "mongoose";

const questionSchema = mongoose.Schema({
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ["mcq", "descriptive", "coding"],
    default: "mcq",
  },
  marks: { type: Number, default: 1 },
  options: [String],
  correctAnswer: String,
});

const examSchema = mongoose.Schema(
  {
    title: { type: String, required: true },
    duration: { type: Number, required: true, min: 1 },
    instructions: { type: String, default: "" },
    questions: [questionSchema],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    assignedStudents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },
    negativeMarking: { type: Boolean, default: false },
    negativeMarkValue: { type: Number, default: 0.25 },
    maxViolations: { type: Number, default: 4 },
    startTime: Date,
    endTime: Date,
    seeded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

examSchema.index({ assignedStudents: 1 });
examSchema.index({ createdBy: 1 });
examSchema.index({ status: 1 });

const Exam = mongoose.model("Exam", examSchema);

export default Exam;
