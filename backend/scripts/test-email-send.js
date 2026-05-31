import "dotenv/config";
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const secure = process.env.SMTP_SECURE === "true";
const from = process.env.SMTP_FROM || user;

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
});

console.log("Sending test email to:", user);

transporter.sendMail({
  from,
  to: user,
  subject: "ProctorAI Test Email",
  text: "This is a test email from ProctorAI to verify SMTP sending.",
  html: "<p>This is a test email from <strong>ProctorAI</strong> to verify SMTP sending.</p>",
}, (error, info) => {
  if (error) {
    console.error("Failed to send email:", error);
  } else {
    console.log("Email sent successfully!", info);
  }
  process.exit(0);
});
