import { Controller, Post, Body, Get } from '@nestjs/common';
import { AgentConfirmPickupService } from './agent-confirm-pickup.service';
import { CreateAgentConfirmPickupDto } from '../dto/create-agent-confirm-pickup.dto';

@Controller('agent-confirm-pickup')
export class AgentConfirmPickupController {
  constructor(private readonly pickupsService: AgentConfirmPickupService) {}

  @Post('confirm')
  async confirmPickup(@Body() data: CreateAgentConfirmPickupDto) {
    return await this.pickupsService.confirmPickup(data);
  }

  @Get()
  async getAllPickups() {
    return await this.pickupsService.getAllPickups();
  }
}
