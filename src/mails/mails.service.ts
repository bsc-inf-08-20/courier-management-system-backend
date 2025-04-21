import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  async sendAgentAssignmentEmail(agentEmail: string, packetId: string, adminEmail: any) {
    const subject = 'Parcel Assignment Notification';
    const message = `You have been assigned to pick up parcel ID: ${packetId}. Please check your dashboard.`;

    await this.transporter.sendMail({
      from: `"Admin" <${process.env.SMTP_EMAIL}>`,
      to: agentEmail,
      subject,
      text: message,
    });
  }
}
