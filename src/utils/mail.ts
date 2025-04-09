// for sending the mails
import nodemailer from 'nodemailer';

export async function sendMail({
  to,
  name,
  subject,
  body,
}: {
  to: string;
  name: string;
  subject: string;
  body: string; 
}) {
  const { SMTP_PASSWORD, SMTP_EMAIL } = process.env;

  const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_PASSWORD,
    },
  });

  try {
    await transport.verify();
    await transport.sendMail({
      from: `"Courier Admin" <${SMTP_EMAIL}>`,
      to,
      subject,
      html: body,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending error:', error);
  }
}
