import User from "../models/UserModel.js";
import Exam from "../models/ExamModel.js";
import Attempt from "../models/AttemptModel.js";
import ProctorLog from "../models/ProctorLogModel.js";
import ExamSession from "../models/ExamSessionModel.js";
import ExamDraft from "../models/ExamDraftModel.js";

const DEMO_PASSWORD = "Demo@123";

const sampleQuestions = (topic) => [
  {
    question: `What is a primary concept in ${topic}?`,
    type: "mcq",
    marks: 1,
    options: [
      "Core principle",
      "Unrelated term",
      "Deprecated API",
      "Random guess",
    ],
    correctAnswer: "Core principle",
  },
  {
    question: `Which statement about ${topic} is TRUE?`,
    type: "mcq",
    marks: 1,
    options: [
      "It improves maintainability",
      "It disables security",
      "It removes authentication",
      "It blocks HTTP",
    ],
    correctAnswer: "It improves maintainability",
  },
  {
    question: `Best practice when using ${topic}?`,
    type: "mcq",
    marks: 1,
    options: [
      "Follow documentation and test",
      "Skip validation",
      "Disable logging",
      "Ignore errors",
    ],
    correctAnswer: "Follow documentation and test",
  },
  {
    question: `Describe one real-world use of ${topic}.`,
    type: "descriptive",
    marks: 2,
    options: [],
    correctAnswer: "",
  },
  {
    question: `Write a short ${topic} function skeleton (pseudocode OK).`,
    type: "coding",
    marks: 2,
    options: [],
    correctAnswer: "",
  },
];

export const seedDatabase = async (req, res) => {
  if (process.env.ALLOW_SEED !== "true") {
    return res.status(403).json({
      message: "Set ALLOW_SEED=true in backend .env to enable seeding",
    });
  }

  try {
    await Promise.all([
      User.deleteMany({ email: { $regex: /@demo\.proctorai\.com$/ } }),
      Exam.deleteMany({ seeded: true }),
      Attempt.deleteMany({}),
      ProctorLog.deleteMany({}),
      ExamSession.deleteMany({}),
      ExamDraft.deleteMany({}),
    ]);

    const admin = await User.create({
      name: "Demo Admin",
      email: "admin@demo.proctorai.com",
      password: DEMO_PASSWORD,
      role: "admin",
      approved: true,
    });

    const proctor = await User.create({
      name: "Demo Proctor",
      email: "proctor@demo.proctorai.com",
      password: DEMO_PASSWORD,
      role: "proctor",
      approved: true,
    });

    const students = await User.create([
      {
        name: "Alice Student",
        email: "alice@demo.proctorai.com",
        password: DEMO_PASSWORD,
        role: "student",
        approved: true,
      },
      {
        name: "Bob Student",
        email: "bob@demo.proctorai.com",
        password: DEMO_PASSWORD,
        role: "student",
        approved: true,
      },
      {
        name: "Carol Student",
        email: "carol@demo.proctorai.com",
        password: DEMO_PASSWORD,
        role: "student",
        approved: true,
      },
    ]);

    const exam1 = await Exam.create({
      title: "JavaScript Fundamentals",
      duration: 30,
      instructions:
        "Stay in fullscreen. Webcam and microphone required. Max 3 violations triggers auto-submit.",
      negativeMarking: true,
      negativeMarkValue: 0.25,
      status: "active",
      seeded: true,
      createdBy: proctor._id,
      assignedStudents: students.map((s) => s._id),
      questions: sampleQuestions("JavaScript"),
    });

    const exam2 = await Exam.create({
      title: "React & Node.js Assessment",
      duration: 45,
      instructions: "Answer all MCQs. Descriptive and coding are manually reviewed.",
      negativeMarking: false,
      status: "active",
      seeded: true,
      createdBy: proctor._id,
      assignedStudents: [students[0]._id, students[1]._id],
      questions: sampleQuestions("React"),
    });

    res.status(201).json({
      message: "Demo database seeded successfully",
      credentials: {
        password: DEMO_PASSWORD,
        admin: admin.email,
        proctor: proctor.email,
        students: students.map((s) => s.email),
      },
      counts: {
        users: 2 + students.length,
        exams: 2,
      },
      exams: [exam1, exam2],
    });
  } catch (error) {
    console.error("seedDatabase:", error);
    res.status(500).json({ message: error.message });
  }
};
