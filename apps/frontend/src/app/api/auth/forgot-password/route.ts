// pages/api/auth/forgot-password.ts
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';



  export async function POST(req:Request) {
  
    try {
      const body = await req.json();
      const { email } = body;
      if (!email) {
        return Response.json({ msg: 'Email is required.' });
      }

  
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        return Response.json({ msg: 'No user found with this email.' });
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
    });

    

   await transporter.sendMail({
      from: 'no-reply@example.com',
      to: email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
    });
    return Response.json({ msg: 'Password reset email sent.' });
  } catch (error) {
    console.error(error);
    return Response.json({ msg: 'Internal server error.' });
  }
}
