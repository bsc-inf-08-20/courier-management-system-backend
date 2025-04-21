import { Controller, Post, Body, BadRequestException, Request } from '@nestjs/common';
import { MailService } from '../mails/mails.service';
import { PacketsService } from '../packets/packets.service';

interface AssignAgentDto {
  agentEmail?: string;
  packetId?: string;
}

@Controller('assign')
export class AssignController {
  constructor(
    private readonly mailService: MailService,
    private readonly packetService: PacketsService,  // Ensure this is correctly injected
  ) {}

  @Post()
  async assignAgent(@Body() body: AssignAgentDto, @Request() req) {
    const { agentEmail, packetId } = body || {};
    const adminEmail = req.user?.email;  // Assuming the admin's email is in the user object after login

    if (!agentEmail || !packetId) {
      throw new BadRequestException('Both agentEmail and packetId are required.');
    }

    if (!adminEmail) {
      throw new BadRequestException('Admin email is required but not found in session.');
    }

    try {
      await this.packetService.assignToAgent(packetId, agentEmail);
      console.log(`Packet ${packetId} assigned to agent ${agentEmail}.`);
    } catch (err) {
      console.error('Database error:', err);
      throw new BadRequestException('Failed to assign packet to agent.');
    }

    try {
      await this.mailService.sendAgentAssignmentEmail(agentEmail, packetId, adminEmail);
      console.log(`Assignment email sent to ${agentEmail}.`);
    } catch (err) {
      console.error('Email error:', err);
      throw new BadRequestException('Failed to send assignment email.');
    }

    return {
      message: `Packet ${packetId} successfully assigned and email sent to ${agentEmail}.`,
    };
  }
}
