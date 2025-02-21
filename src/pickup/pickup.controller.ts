import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PickupService } from './pickup.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PickupRequestDto } from '../dto/pickup-request.dto';
import { Role } from 'src/enum/role.enum';

@Controller('pickup')
export class PickupController {
  constructor(private readonly pickupService: PickupService) {}

  // Customer books a pickup
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @Post('request')
  async requestPickup(@Request() req, @Body() pickupData: PickupRequestDto) {
    return this.pickupService.requestPickup(req.user.userId, pickupData);
  }

  // Admin assigns an agent based on location
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Post('assign/:pickupId')
  async assignAgent(@Param('pickupId') pickupId: number, @Body() data: { location: string }) {
    return this.pickupService.assignAgent(pickupId, data.location);
  }

  // Agent gets assigned pickups
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  @Get('assigned')
  async getAssignedPickups(@Request() req) {
    return this.pickupService.getAgentPickups(req.user.userId);
  }
}
