import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
  const secure = process.env.SMTP_SECURE === "true";

  if (!host || !user || !pass) {
    console.warn("SMTP not configured. Emails will be logged instead of sent.");
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
};

const transporter = createTransporter();

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.log(`sendEmail (stub): to=${to} subject=${subject}`);
    return { ok: true, stub: true };
  }

  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM || `no-reply@${process.env.SMTP_HOST}`;

  const info = await transporter.sendMail({ from, to, subject, text, html });
  return info;
};

export default { sendEmail };
