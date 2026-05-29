import { Server } from "socket.io";
import ExamSession from "../models/ExamSessionModel.js";

let ioInstance = null;

export const getIO = () => ioInstance;

export const initSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  ioInstance = io;

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("joinProctorRoom", () => {
      socket.join("proctors");
    });

    socket.on("joinExamChat", ({ examId }) => {
      if (examId) socket.join(`exam-chat-${examId}`);
    });

    socket.on("proctorEvent", (data) => {
      io.to("proctors").emit("proctorEvent", data);
      io.emit("proctorEvent", data);
    });

    socket.on("webcamFrame", async (data) => {
      const { studentId, examId, frame, studentName } = data;
      if (studentId && examId && frame) {
        await ExamSession.findOneAndUpdate(
          { studentId, examId, status: "active" },
          { lastWebcamFrame: frame },
          { upsert: false }
        );
      }
      io.to("proctors").emit("webcamFrame", {
        studentId,
        examId,
        frame,
        studentName,
        timestamp: Date.now(),
      });
    });

    socket.on("examChat", (data) => {
      io.to(`exam-chat-${data.examId}`).emit("examChat", {
        ...data,
        timestamp: Date.now(),
      });
    });

    socket.on("sessionStarted", (data) => {
      io.to("proctors").emit("sessionStarted", data);
      broadcastStats(io);
    });

    socket.on("sessionEnded", (data) => {
      io.to("proctors").emit("sessionEnded", data);
      broadcastStats(io);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  setInterval(() => broadcastStats(io), 15000);

  return io;
};

async function broadcastStats(io) {
  try {
    const activeSessions = await ExamSession.countDocuments({
      status: "active",
    });
    const sessions = await ExamSession.find({ status: "active" })
      .populate("studentId", "name email")
      .populate("examId", "title")
      .limit(20);

    io.to("proctors").emit("dashboardStats", {
      activeStudents: activeSessions,
      examsRunning: sessions.length,
      warnings: sessions.reduce((s, x) => s + (x.warnings || 0), 0),
      suspiciousActivities: sessions.reduce(
        (s, x) => s + (x.cheatingScore || 0),
        0
      ),
      sessions,
    });
  } catch (e) {
    console.warn("dashboardStats broadcast failed", e.message);
  }
}

export default initSocket;
