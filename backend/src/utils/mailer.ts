import nodemailer from 'nodemailer';
import { env } from '../config/env';

let transporter: nodemailer.Transporter | null = null;

if (env.smtpHost && env.smtpUser && env.smtpPassword) {
  transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpPort === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPassword,
    },
  });
} else {
  console.warn('⚠️ SMTP configuration is missing. Emails will not be sent, only logged.');
}

export const sendEmail = async (to: string, subject: string, html: string) => {
  if (!transporter) {
    console.log(`\n📧 [SIMULATED EMAIL] To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}\n`);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: env.smtpFrom,
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    throw error;
  }
};
