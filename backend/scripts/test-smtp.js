import "dotenv/config";
import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const secure = process.env.SMTP_SECURE === "true";

console.log("SMTP Config:", { host, user, pass: pass ? "****" : null, port, secure });

if (!host || !user || !pass) {
  console.error("SMTP not configured in env");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("Transporter verify failed:", error);
  } else {
    console.log("SMTP connection verified successfully!");
  }
  process.exit(0);
});
