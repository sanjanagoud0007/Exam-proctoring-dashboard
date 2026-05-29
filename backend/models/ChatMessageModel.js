import mongoose from "mongoose";

const chatMessageSchema = mongoose.Schema(
  {
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderRole: String,
    senderName: String,
    message: { type: String, required: true },
    room: { type: String, default: "exam-support" },
  },
  { timestamps: true }
);

export default mongoose.model("ChatMessage", chatMessageSchema);
