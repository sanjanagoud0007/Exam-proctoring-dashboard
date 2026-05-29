import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/UserModel.js';
import Exam from '../models/ExamModel.js';

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const adminEmail = 'admin@examproctor.com';
const adminPassword = 'Admin123!';

let admin = await User.findOne({ email: adminEmail });
if (!admin) {
  admin = await User.create({
    name: 'Admin User',
    email: adminEmail,
    password: adminPassword,
    role: 'admin',
    approved: true,
  });
  console.log('Created admin user:', adminEmail);
} else {
  admin.role = 'admin';
  admin.approved = true;
  await admin.save();
  console.log('Admin user already exists and was updated:', adminEmail);
}

const sampleExam = await Exam.create({
  title: 'JavaScript Fundamentals',
  duration: 45,
  questions: [
    {
      question: 'What is the correct syntax to log to the console?',
      options: ['console.log()', 'print()', 'log.console()'],
      correctAnswer: 'console.log()',
    },
    {
      question: 'Which keyword declares a variable in ES6?',
      options: ['var', 'let', 'def'],
      correctAnswer: 'let',
    },
    {
      question: 'What does === mean in JavaScript?',
      options: ['Assignment', 'Strict equality', 'Loose equality'],
      correctAnswer: 'Strict equality',
    },
  ],
  createdBy: admin._id,
});

console.log('Created sample exam:', sampleExam.title);
await mongoose.disconnect();
