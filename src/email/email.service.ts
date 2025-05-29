import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  // Add this new method for pickup assignment
  async sendPickupAssignmentNotification(
    agentEmail: string,
    packageDetails: {
      trackingId: string;
      pickupLocation: string;
      senderName: string;
      senderContact: string;
    }
  ) {
    await this.mailerService.sendMail({
      to: agentEmail,
      subject: 'New Package Pickup Assignment',
      html: `
        <h1>New Package Pickup Assignment</h1>
        <p>You have been assigned to pick up a new package:</p>
        <ul>
          <li>Tracking ID: ${packageDetails.trackingId}</li>
          <li>Pickup Location: ${packageDetails.pickupLocation}</li>
          <li>Sender Name: ${packageDetails.senderName}</li>
          <li>Contact: ${packageDetails.senderContact}</li>
        </ul>
      `,
    });
  }

  // Add this new method for delivery assignment
  async sendDeliveryAssignmentNotification(
    agentEmail: string,
    packageDetails: {
      trackingId: string;
      deliveryLocation: string;
      recipientName: string;
      recipientContact: string;
    }
  ) {
    await this.mailerService.sendMail({
      to: agentEmail,
      subject: 'New Package Delivery Assignment',
      html: `
        <h1>New Package Delivery Assignment</h1>
        <p>You have been assigned to deliver a package:</p>
        <ul>
          <li>Tracking ID: ${packageDetails.trackingId}</li>
          <li>Delivery Location: ${packageDetails.deliveryLocation}</li>
          <li>Recipient Name: ${packageDetails.recipientName}</li>
          <li>Contact: ${packageDetails.recipientContact}</li>
        </ul>
      `,
    });
  }

  async sendDeliveryConfirmationToSender(
    senderEmail: string,
    packageDetails: {
      trackingId: string;
      recipientName: string;
      deliveryLocation: string;
      deliveryTime: Date;
    },
  ) {
    await this.mailerService.sendMail({
      to: senderEmail,
      subject: 'Package Delivered Successfully',
      html: `
        <h1>Package Delivered Successfully</h1>
        <p>Your package has been delivered successfully:</p>
        <ul>
          <li>Tracking ID: ${packageDetails.trackingId}</li>
          <li>Delivered to: ${packageDetails.recipientName}</li>
          <li>Delivery Location: ${packageDetails.deliveryLocation}</li>
          <li>Delivery Time: ${packageDetails.deliveryTime.toLocaleString()}</li>
        </ul>
      `,
    });
  }
}
