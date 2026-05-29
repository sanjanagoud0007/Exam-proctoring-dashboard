import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "node:http";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import proctorRoutes from "./routes/proctorRoutes.js";
import attemptRoutes from "./routes/attemptRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import recordingRoutes from "./routes/recordingRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import seedRoutes from "./routes/seedRoutes.js";
import { initSocket } from "./sockets/socket.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

connectDB();

const app = express();

const CLIENT_ORIGIN =
  process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: CLIENT_ORIGIN.split(",").map((o) => o.trim()),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    credentials: true,
  })
);

app.use(rateLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/proctor", proctorRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/recordings", recordingRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/seed", seedRoutes);

app.get("/", (req, res) => {
  res.send("Exam Proctoring Backend Running");
});

app.use(notFound);
app.use(errorHandler);

const DEFAULT_PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

const server = http.createServer(app);
initSocket(server);

const tryListen = (port) => {
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`CORS origin: ${CLIENT_ORIGIN}`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.warn(`Port ${port} in use, trying ${port + 1}...`);
      server.removeAllListeners("error");
      tryListen(port + 1);
    } else {
      console.error(err);
      process.exit(1);
    }
  });
};

tryListen(DEFAULT_PORT);
