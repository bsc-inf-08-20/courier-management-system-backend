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
  NotFoundException,
  Query,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PickupService } from './pickup.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { CreatePacketPickupDto } from 'src/dto/pickup-request.dto';
import { Role } from 'src/enum/role.enum';
import { AssignAgentDto } from 'src/dto/assign-agent.dto';
import { PickupRequest } from 'src/entities/PickupRequest.entity';
import { PacketsService } from 'src/packets/packets.service';
import { UsersService } from 'src/users/users.service';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/User.entity';
import { Repository } from 'typeorm';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('pickup')
@ApiTags('Pickup')
export class PickupController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly pickupService: PickupService,
    private readonly usersService: UsersService,
  ) {}

  // Customer books a pickup
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.USER)
  @Post('request')
  @ApiOperation({ summary: 'Request a pickup' })
  @ApiBody({ type: CreatePacketPickupDto })
  @ApiCreatedResponse({
    description: 'Pickup request created successfully',
    type: PickupRequest,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async requestPickup(@Request() req, @Body() pickupData: CreatePacketPickupDto) {
    return this.pickupService.requestPickup(req.user.user_id, pickupData);
  }

  @Patch(':id/assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign agent to pickup request' })
  @ApiParam({ name: 'id', type: 'string', description: 'Pickup Request ID' })
  @ApiBody({ type: AssignAgentDto })
  @ApiOkResponse({
    description: 'Agent assigned to pickup request successfully',
    type: PickupRequest,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Pickup request not found' })
  async assignAgentToRequest(
    @Param('id') id: string,
    @Body() assignAgentDto: AssignAgentDto,
    @Request() req,
  ) {
    return this.pickupService.assignAgent(
      parseInt(id),
      assignAgentDto.agentId,
      req.user.user_id,
    );
  }

  // Agent gets assigned pickups
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  @Get('assigned')
  @ApiOperation({ summary: 'Get assigned pickups for agent' })
  @ApiOkResponse({
    description: 'Assigned pickups retrieved successfully',
    type: [PickupRequest],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getAssignedPickups(@Request() req) {
    return this.pickupService.getAgentPickups(req.user.userId);
  }

  // get pickup request by admin's city
  @Get('requests')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get pickup requests by city' })
  @ApiQuery({ name: 'city', type: 'string', description: 'City' })
  @ApiOkResponse({
    description: 'Pickup requests retrieved successfully',
    type: [PickupRequest],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getPickupRequestsByCity(@Query('city') city: string) {
    return this.pickupService.getPickupRequestsByCity(city);
  }

  //delivered status
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // 🔒 Only admin can access this
  @Patch(':pickupId/deliver')
  @ApiOperation({ summary: 'Mark pickup as delivered' })
  @ApiParam({ name: 'pickupId', type: 'number', description: 'Pickup ID' })
  @ApiOkResponse({
    description: 'Pickup marked as delivered successfully',
    type: PickupRequest,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Pickup request not found' })
  async markAsDelivered(@Param('pickupId') pickupId: number, @Request() req) {
    return this.pickupService.markAsDelivered(pickupId, req.user.user_id);
  }

  // ✅ Get packets for a specific pickup request
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  @Get(':pickupId/packets')
  @ApiOperation({ summary: 'Get packets for a pickup request' })
  @ApiParam({ name: 'pickupId', type: 'number', description: 'Pickup ID' })
  @ApiOkResponse({
    description: 'Packets retrieved successfully for pickup',
    type: [PickupRequest],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Pickup request not found' })
  async getPacketsByPickup(
    @Param('pickupId') pickupId: number,
    @Request() req,
  ) {
    return this.pickupService.getPacketsByPickup(pickupId, req.user.userId);
  }

  //get specific requests for specific agent
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  @Get('requests/agent')
  @ApiOperation({ summary: 'Get requests for agent' })
  @ApiQuery({ name: 'status', type: 'string', description: 'Request Status' })
  @ApiQuery({ name: 'agentId', type: 'string', description: 'Agent ID' })
  @ApiOkResponse({
    description: 'Requests retrieved successfully for agent',
    type: [PickupRequest],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Invalid query parameters' })
  async getRequests(
    @Query('status') status: string,
    @Query('agentId') agentId: string,
    @Request() req,
  ) {
    console.log('User making request:', req.user); // Debug log
    console.log('Received query params:', { status, agentId });

    const parsedAgentId = parseInt(agentId);
    if (status === 'assigned' && agentId) {
      if (parsedAgentId !== req.user.user_id) {
        throw new ForbiddenException(
          'You can only view your own assigned requests',
        );
      }
      return this.pickupService.getAssignedRequestsForAgent(parsedAgentId);
    }
    throw new BadRequestException('Invalid query parameters');
  }

  // get all the pickup request
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN) // Only admins can access this route
  @Get('requests')
  @ApiOperation({ summary: 'Get all pickup requests' })
  @ApiOkResponse({
    description: 'All pickup requests retrieved successfully',
    type: [PickupRequest],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  async getAllPickupRequests() {
    return this.pickupService.getAllPickupRequests();
  }

  // unAssigning
  @Patch(':id/unassign')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Unassign agent from pickup request' })
  @ApiParam({ name: 'id', type: 'number', description: 'Pickup Request ID' })
  @ApiOkResponse({
    description: 'Agent unassigned from pickup request successfully',
    type: PickupRequest,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Pickup request not found' })
  async unassignAgent(
    @Param('id', ParseIntPipe) requestId: number,
  ): Promise<PickupRequest> {
    return this.pickupService.unassignAgent(requestId);
  }

  // get agents for admin
  @Get('admin/agents')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get agents for admin' })
  @ApiOkResponse({
    description: 'Agents retrieved successfully for admin',
    type: [User],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiNotFoundResponse({ description: 'Admin not found' })
  async getAgentsForAdmin(@Request() req) {
    const admin = await this.userRepository.findOneBy({
      user_id: req.user.user_id,
    });

    if (!admin) {
      throw new NotFoundException('Admin not found'); // ✅ Handle null case
    }

    return this.usersService.getAgentsByCity(admin.city);
  }
}
