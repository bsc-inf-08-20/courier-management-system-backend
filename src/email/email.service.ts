import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  // Add this new method for pickup assignment
async sendPickupAssignmentNotification(
  agentEmail: string,
  packageDetails: {
    // trackingId: string; // REMOVE THIS
    description: string; // ADD THIS
    pickupLocation: string;
    senderName: string;
    senderContact: string;
  },
) {
  await this.mailerService.sendMail({
    to: agentEmail,
    subject: 'New Package Pickup Assignment',
    html: `
      <h1>New Package Pickup Assignment</h1>
      <p>You have been assigned to pick up a new package:</p>
      <ul>
        <li><b>Description:</b> ${packageDetails.description}</li>
        <li><b>Pickup Location:</b> ${packageDetails.pickupLocation}</li>
        <li><b>Sender Name:</b> ${packageDetails.senderName}</li>
        <li><b>Contact:</b> ${packageDetails.senderContact}</li>
      </ul>
    `,
  });
}

  // Add this new method for delivery assignment
  async sendDeliveryAssignmentNotification(
    agentEmail: string,
    packageDetails: {
      description: string;
      deliveryLocation: string;
      recipientName: string;
      recipientContact: string;
    },
  ) {
    await this.mailerService.sendMail({
      to: agentEmail,
      subject: 'New Package Delivery Assignment',
      html: `
        <h1>New Package Delivery Assignment</h1>
        <p>You have been assigned to deliver a package:</p>
        <ul>
          <li>Packet: ${packageDetails.description}</li>
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
      description: string;
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
          <li>Tracking ID: ${packageDetails.description}</li>
          <li>Delivered to: ${packageDetails.recipientName}</li>
          <li>Delivery Location: ${packageDetails.deliveryLocation}</li>
          <li>Delivery Time: ${packageDetails.deliveryTime.toLocaleString()}</li>
        </ul>
      `,
    });
  }

  async sendPickupConfirmationToSender(
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

  async sendArrivalAtHubNotification(
    receiverEmail: string,
    packageDetails: {
      trackingId: string;
      originCity: string;
      destinationHub: string;
      description: string;
    },
  ) {
    await this.mailerService.sendMail({
      to: receiverEmail,
      subject: 'Your Package Has Arrived at the Destination Hub',
      html: `
      <h1>Package Arrival Notification</h1>
      <p>Your package has arrived at the destination hub.</p>
      <ul>
        <li>Tracking ID: ${packageDetails.trackingId}</li>
        <li>From: ${packageDetails.originCity}</li>
        <li>To (Hub): ${packageDetails.destinationHub}</li>
        <li>Description: ${packageDetails.description}</li>
      </ul>
      <p>Please visit the hub to collect your package or wait for delivery if you selected home delivery.</p>
    `,
    });
  }

  async sendBookingConfirmationToSender(
    senderEmail: string,
    details: {
      trackingId: string;
      originCity: string;
      destination: string;
      description: string;
    },
  ) {
    await this.mailerService.sendMail({
      to: senderEmail,
      subject: 'Your Courier Booking is Confirmed',
      html: `
      <h1>Booking Confirmed</h1>
      <p>Your booking has been created.</p>
      <ul>
        <li><b>Tracking ID:</b> ${details.trackingId} <br><i>(Use this ID any time to track your package!)</i></li>
        <li><b>From:</b> ${details.originCity}</li>
        <li><b>To:</b> ${details.destination}</li>
        <li><b>Description:</b> ${details.description}</li>
      </ul>
      <p>You will receive further notifications as your package moves through the courier system.</p>
    `,
    });
  }

  // Method to send a receipt email after booking a courier
  async sendPacketReceipt(
    toEmail: string,
    details: {
      trackingId: string;
      description: string;
      weight: string | number;
      category: string;
      sender: { name: string; email: string; phone_number: string };
      receiver: { name: string; email: string; phone_number: string };
      origin_city: string;
      destination_hub: string;
      delivery_type: string;
      totalAmount: number;
      created_at: string;
    },
  ) {
    await this.mailerService.sendMail({
      to: toEmail,
      subject: `Courier Booking Receipt – Tracking ID: ${details.trackingId}`,
      html: `
      <h2>Courier Booking Receipt</h2>
      <p><b>Tracking ID:</b> ${details.trackingId}</p>
      <p><b>Description:</b> ${details.description}</p>
      <p><b>Weight:</b> ${details.weight} kg</p>
      <p><b>Category:</b> ${details.category}</p>
      <h4>Sender Details:</h4>
      <ul>
        <li>Name: ${details.sender.name}</li>
        <li>Email: ${details.sender.email}</li>
        <li>Phone: ${details.sender.phone_number}</li>
      </ul>
      <h4>Receiver Details:</h4>
      <ul>
        <li>Name: ${details.receiver.name}</li>
        <li>Email: ${details.receiver.email}</li>
        <li>Phone: ${details.receiver.phone_number}</li>
      </ul>
      <h4>Location Details:</h4>
      <ul>
        <li>Origin: ${details.origin_city}</li>
        <li>Destination: ${details.destination_hub}</li>
        <li>Delivery Type: ${details.delivery_type === 'delivery' ? 'Home Delivery' : 'Hub Pickup'}</li>
      </ul>
      <h4>Payment Details:</h4>
      <ul>
        <li>Total Amount: MWK ${details.totalAmount}</li>
      </ul>
      <p>Date: ${details.created_at}</p>
      <p>Thank you for using our service!</p>
    `,
    });
  }
}
