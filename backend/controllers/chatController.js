import ChatMessage from "../models/ChatMessageModel.js";

export const getChatMessages = async (req, res) => {
  try {
    const { examId } = req.params;
    const messages = await ChatMessage.find({ examId })
      .sort({ createdAt: 1 })
      .limit(200);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const postChatMessage = async (req, res) => {
  try {
    const { examId } = req.params;
    const { message } = req.body;

    const doc = await ChatMessage.create({
      examId,
      message,
      senderId: req.user._id,
      senderRole: req.user.role,
      senderName: req.user.name,
    });

    res.status(201).json(doc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
