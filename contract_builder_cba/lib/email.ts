import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.WS_SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.WS_SMTP_PORT || "587"),
  secure: process.env.WS_SMTP_PORT === "465",
  auth: {
    user: process.env.WS_SMTP_USER,
    pass: process.env.WS_SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; path: string }>;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.WS_SMTP_USER) {
      console.log(`[Email Mock] To: ${options.to}, Subject: ${options.subject}`);
      console.log(`[Email Mock] Body preview: ${options.html.substring(0, 200)}...`);
      return true;
    }

    await transporter.sendMail({
      from: process.env.WS_SMTP_FROM || "noreply@websigner.com",
      ...options,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
