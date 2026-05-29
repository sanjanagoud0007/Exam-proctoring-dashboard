import { sendEmail } from "./emailService.js";
import { VIOLATION_SCORES } from "../utils/cheatingScore.js";
import welcomeEmailTemplate from "../templates/welcomeEmail.js";
import otpEmailTemplate from "../templates/otpEmail.js";
import resetSuccessEmailTemplate from "../templates/resetSuccessEmail.js";
import examAssignedEmailTemplate from "../templates/examAssignedEmail.js";
import resultPublishedEmailTemplate from "../templates/resultPublishedEmail.js";

export const sendWelcomeEmail = async (user) => {
  try {
    await sendEmail({
      to: user.email,
      subject: "Welcome to ProctorAI",
      text: `Hi ${user.name},\n\nThank you for registering with ProctorAI. Your account is now active.\n\nBest regards,\nProctorAI Team`,
      html: welcomeEmailTemplate(user.name),
    });
  } catch (error) {
    console.warn("Failed to send welcome email:", error);
  }
};

export const sendOtpEmail = async (user, otp) => {
  try {
    console.log(`\n==================================================`);
    console.log(`[OTP Verification Code for ${user.email}]: ${otp}`);
    console.log(`==================================================\n`);
    await sendEmail({
      to: user.email,
      subject: `${otp} is your ProctorAI Verification Code`,
      text: `Your verification code is ${otp}. Valid for 5 minutes.`,
      html: otpEmailTemplate(user.name, otp),
    });
  } catch (error) {
    console.warn(`Failed to send OTP email to ${user.email}. Fallback OTP code: ${otp}`, error);
  }
};

export const sendResetSuccessEmail = async (user) => {
  try {
    await sendEmail({
      to: user.email,
      subject: "Password Reset Successful — ProctorAI",
      text: `Hi ${user.name},\n\nYour password was successfully reset.\n\nBest regards,\nProctorAI Security Team`,
      html: resetSuccessEmailTemplate(user.name),
    });
  } catch (error) {
    console.warn("Failed to send reset success email:", error);
  }
};

export const sendExamAssignedEmail = async (student, exam) => {
  try {
    await sendEmail({
      to: student.email,
      subject: `Exam Assigned: ${exam.title}`,
      text: `Hi ${student.name},\n\nYou have been assigned "${exam.title}". Duration: ${exam.duration} minutes.\n\nLogin to start.`,
      html: examAssignedEmailTemplate(student.name, exam),
    });
  } catch (error) {
    console.warn("Failed to send exam assignment email:", error);
  }
};

export const sendResultPublishedEmail = async (student, exam, attempt) => {
  try {
    await sendEmail({
      to: student.email,
      subject: `Results Published: ${exam.title}`,
      text: `Hi ${student.name},\n\nYour exam "${exam.title}" results are available.\nScore: ${attempt.score}`,
      html: resultPublishedEmailTemplate(student.name, exam, attempt),
    });
  } catch (error) {
    console.warn("Failed to send results email:", error);
  }
};

export const sendWarningAlertEmail = async (student, exam, eventType) => {
  try {
    const points = VIOLATION_SCORES[eventType] || 5;
    await sendEmail({
      to: student.email,
      subject: `Exam Warning: ${eventType}`,
      text: `Warning during "${exam.title}": ${eventType} (+${points} risk points).`,
      html: `<p>Integrity warning during <strong>${exam.title}</strong>: <strong>${eventType}</strong> (+${points} points).</p>`,
    });
  } catch (error) {
    console.warn("Failed to send warning email:", error);
  }
};

