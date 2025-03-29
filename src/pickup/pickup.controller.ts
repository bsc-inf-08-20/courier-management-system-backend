import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { PickupService } from './pickup.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { PickupRequestDto } from '../dto/pickup-request.dto';
import { Role } from 'src/enum/role.enum';
import { AssignAgentDto } from 'src/dto/assign-agent.dto';
import { PickupRequest } from 'src/entities/PickupRequest.entity';

@Controller('pickup')
export class PickupController {
  constructor(private readonly pickupService: PickupService) {}

  // Customer books a pickup
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @Post('request')
  async requestPickup(@Request() req, @Body() pickupData: PickupRequestDto) {
    return this.pickupService.requestPickup(req.user.user_id, pickupData);
  }

  // Admin assigns an agent based on location
  //
  // @Post('assign/:pickupId')
  // async assignAgent(@Param('pickupId') pickupId: number) {
  //   return this.pickupService.assignAgent(pickupId);
  // }

  // Only admin can assign agents
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Patch(':id/assign')
  async assignAgent(
    @Param('id') requestId: number,
    @Body() assignAgentDto: AssignAgentDto,
  ) {
    return this.pickupService.assignAgent(
      requestId,
      assignAgentDto.assignedAgentUserId,
    );
  }

  // Agent gets assigned pickups
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  @Get('assigned')
  async getAssignedPickups(@Request() req) {
    return this.pickupService.getAgentPickups(req.user.userId);
  }

  //delivered status
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT) // 🔒 Only agents can access this
  @Patch(':pickupId/deliver')
  async markAsDelivered(@Param('pickupId') pickupId: number, @Request() req) {
    //console.log(pickupId, req.user.user_id)
    return this.pickupService.markAsDelivered(pickupId, req.user.user_id);
  }

  // ✅ Get packets for a specific pickup request
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Get(':pickupId/packets')
  async getPacketsByPickup(
    @Param('pickupId') pickupId: number,
    @Request() req,
  ) {
    return this.pickupService.getPacketsByPickup(pickupId, req.user.userId);
  }

  // get all the pickup request
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // Only admins can access this route
  @Get('requests')
  async getAllPickupRequests() {
    return this.pickupService.getAllPickupRequests();
  }

  // unAssigning
  @Patch(':id/unassign')
  @Roles(Role.ADMIN)
  async unassignAgent(
    @Param('id', ParseIntPipe) requestId: number,
  ): Promise<PickupRequest> {
    return this.pickupService.unassignAgent(requestId);
  }
}
