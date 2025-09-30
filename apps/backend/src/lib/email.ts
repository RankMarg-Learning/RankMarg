import { Resend } from "resend";
import ServerConfig from "@/config/server.config";

const resend = new Resend(ServerConfig.resendApiKey);

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
};

export async function sendEmail({ to, subject, html, from }: SendEmailInput) {
  const fromAddress = from || ServerConfig.emailAddress;

  const result = await resend.emails.send({
    from: fromAddress,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message || "Failed to send email via Resend");
  }

  return result.data;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. Click the button below to proceed. This link will expire in 60 minutes.</p>
      <p style="margin: 24px 0;">
        <a href="${resetUrl}" style="background:#fad02c;color:#111827;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block">Reset Password</a>
      </p>
      <p>If the button doesn't work, copy and paste this URL into your browser:</p>
      <p><a style="color: #fad02c; " href="${resetUrl}">${resetUrl}</a></p>
      <p>If you did not request a password reset, you can safely ignore this email.</p>
      <p >Rankmarg Team</p>
      <p style="font-size:12px;color:#6b7280;margin:0;text-align:center;">©${new Date().getFullYear()} RankMarg. All rights reserved.</p>
      <p style="font-size:12px;color:#6b7280;margin:4px 0 0;text-align:center;">RankMarg | Learn, Solve, Achieve</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: "Password Reset - RankMarg ",
    html,
  });
}
