import { PasswordResetEmail } from '@/constant/passwordResetEmail';
import prisma from '@/lib/prisma';
import { jsonResponse } from '@/utils/api-response';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';



  export async function POST(req:Request) {
  
    try {
      const body = await req.json();
      const { email } = body;
      if (!email) {
        return jsonResponse(null, { success: false, message: "Email is required", status: 400 });
      }

  
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return jsonResponse(null, { success: false, message: "No user found", status: 404 });
      }

    
    const resetToken = jwt.sign(
        { email, purpose: 'password-reset', exp: Math.floor(Date.now() / 1000) + 3600 }, // 1-hour expiry
        process.env.JWT_SECRET_RESET
      );
    // Create the reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;
    // // Send the reset email
    const transporter  = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    } as SMTPTransport.Options);
  
   await transporter.sendMail({
      from: 'support@rankmarg.in',
      to: email,
      subject: 'Password Reset',
      html: PasswordResetEmail(resetUrl),
    });
    return jsonResponse(null, { success: true, message: "Ok", status: 200 });
  } catch (error) {
    console.error(error);
    return jsonResponse(null, { success: false, message: "Internal Server Error", status: 500 });
  }
}
