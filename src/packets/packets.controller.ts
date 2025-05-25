import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PacketsService } from './packets.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enum/role.enum';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UpdatePacketWeightDto } from 'src/dto/update-packet-weight.dto';
import { Packet } from 'src/entities/Packet.entity';
import { CreatePacketDto } from 'src/dto/create-packet.dto';
import { Vehicle } from 'src/entities/Vehicle.entity';

@Controller('packets')
export class PacketsController {
  constructor(private readonly packetsService: PacketsService) {}

  // Post a packet from admin's panel
  @Post()
  async createPacket(
    @Body() createPacketDto: CreatePacketDto,
    @Request() req,
  ): Promise<Packet> {
    // const admin = req.user; // Assuming user is attached via JWT or auth middleware
    return this.packetsService.createPacket(createPacketDto);
  }

  // GET all packets
  @Get()
  async getAllPackets() {
    return this.packetsService.getAllPackets();
  }

  //get admins packet
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getAdminPackets(@Request() req) {
    return this.packetsService.getPacketsForAdmin(req.user.user_id);
  }

  // get the origin-coordinates
  @Get(':id/origin-coordinates')
  async getOriginCoordinates(@Param('id', ParseIntPipe) id: number) {
    return this.packetsService.getPacketOriginCoordinates(id);
  }

  // get the destination-coordinates
  @Get(':id/destination-coordinates')
  async getDestinationCoordinates(@Param('id') id: number) {
    return this.packetsService.getPacketDestinationCoordinates(id);
  }

  // Admins in Lilongwe, Blantyre, or Zomba confirm dispatch:
  @Patch(':id/confirm-dispatch')
  async confirmDispatch(@Param('id') id: number) {
    return this.packetsService.confirmPacketDispatch(id);
  }

  // change/comfirm and update weight
  @Patch(':id/weight')
  async updateWeight(
    @Param('id') id: string,
    @Body() updatePacketWeightDto: UpdatePacketWeightDto,
  ) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Invalid packet ID');
    }
    if (updatePacketWeightDto.weight <= 0) {
      throw new BadRequestException('Weight must be greater than 0');
    }

    return this.packetsService.updateWeight(+id, updatePacketWeightDto.weight);
  }

  @Patch(':id/agent-confirm')
  async agentConfirmCollection(
    @Param('id') id: string,
    @Body() updatePacketDto: UpdatePacketWeightDto,
  ) {
    if (isNaN(Number(id))) {
      throw new BadRequestException('Invalid packet ID');
    }

    return this.packetsService.agentConfirmCollection(
      +id,
      updatePacketDto.weight,
    );
  }

  @Patch(':id/hub-confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async adminConfirmAtHub(@Param('id') id: string) {
    return this.packetsService.adminConfirmAtHub(parseInt(id));
  }

  @Patch(':id/dispatch')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async adminDispatchForTransport(@Param('id') id: string) {
    return this.packetsService.adminDispatchForTransport(parseInt(id));
  }

  @Get('at-origin-hub')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getPacketsAtOriginHub(@Query('city') city: string, @Request() req) {
    if (!city) {
      throw new BadRequestException('City parameter is required');
    }

    // Optional city authorization - only check if accessible_cities exists
    if (req.user.accessible_cities) {
      if (!req.user.accessible_cities.includes(city)) {
        throw new HttpException(
          'Unauthorized access to this city',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return this.packetsService.getPacketsAtOriginHub(city);
  }

  @Get('in-transit')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getPacketsInTransitFromOrigin(
    @Query('origin') origin: string,
    @Request() req,
  ) {
    if (!origin) {
      throw new BadRequestException('Origin parameter is required');
    }

    // Optional city authorization - only check if accessible_cities exists
    if (req.user?.accessible_cities) {
      if (!req.user.accessible_cities.includes(origin)) {
        throw new HttpException(
          'Unauthorized access to this origin city',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return this.packetsService.getPacketsInTransitFromOrigin(origin);
  }

  @Get('in-transit/incoming')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async getPacketsInTransitIncoming(
    @Query('origin') origin: string,
    @Request() req,
  ) {
    if (!origin) {
      throw new BadRequestException('Origin parameter is required');
    }

    // Optional city authorization - only check if accessible_cities exists
    if (req.user?.accessible_cities) {
      if (!req.user.accessible_cities.includes(origin)) {
        throw new HttpException(
          'Unauthorized access to this origin city',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    return this.packetsService.getPacketsInTransitIcoming(origin);
  }

  @Patch(':id/destination-hub-confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async confirmAtDestinationHub(@Param('id') id: string) {
    return this.packetsService.confirmAtDestinationHub(parseInt(id));
  }

  @Patch(':id/out-for-delivery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  async markOutForDelivery(@Param('id') id: string, @Request() req) {
    return this.packetsService.markOutForDelivery(parseInt(id));
  }

  @Patch(':id/delivered')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  async markAsDelivered(@Param('id') id: string, @Request() req) {
    return this.packetsService.markAsDelivered(parseInt(id));
  }

  @Patch(':id/received')
  @UseGuards(JwtAuthGuard)
  async confirmReceiverReceived(@Param('id') id: string) {
    return this.packetsService.confirmReceiverReceived(parseInt(id));
  }

  @Post('dispatch-batch')
  @Roles(Role.ADMIN)
  async dispatchBatch(
    @Body() body: { packetIds: number[]; driverId: number; vehicleId: number },
  ) {
    return this.packetsService.dispatchBatch(
      body.packetIds,
      body.driverId,
      body.vehicleId,
    );
  }

  // Dealing with disptching

  @UseGuards(JwtAuthGuard)
  @Post('assign-to-vehicle')
  async assignPacketToVehicle(
    @Body('packetId') packetId: number,
    @Body('vehicleId') vehicleId: number,
    @Request() req,
  ): Promise<Packet> {
    return this.packetsService.assignPacketToVehicle(
      packetId,
      vehicleId,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('assign-multiple-to-vehicle')
  async assignMultiplePacketsToVehicle(
    @Body('packetIds') packetIds: number[],
    @Body('vehicleId') vehicleId: number,
    @Request() req,
  ): Promise<Packet[]> {
    return this.packetsService.assignMultiplePacketsToVehicle(
      packetIds,
      vehicleId,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('dispatch-vehicle/:vehicleId')
  async dispatchVehicle(
    @Param('vehicleId') vehicleId: number,
    @Request() req,
  ): Promise<Vehicle> {
    return this.packetsService.dispatchVehicle(vehicleId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('available-vehicles')
  async getAvailableVehicles(
    @Query('city') city: string,
    @Request() req,
  ): Promise<Vehicle[]> {
    return this.packetsService.getAvailableVehicles(city);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unassign-from-vehicle')
  async unassignPacketFromVehicle(
    @Body('packetId') packetId: number,
    @Request() req,
  ): Promise<Packet> {
    return this.packetsService.unassignPacketFromVehicle(packetId, req.user);
  }

  // DEALING WITH DELIVERY
  @UseGuards(JwtAuthGuard)
  @Get('at-destination-hub')
  async getPacketsAtDestinationHub(
    @Query('city') city: string,
  ): Promise<Packet[]> {
    return this.packetsService.getPacketsAtDestinationHub(city);
  }

  @UseGuards(JwtAuthGuard)
  @Get('out-for-delivery')
  async getPacketsOutForDelivery(
    @Query('city') city: string,
  ): Promise<Packet[]> {
    return this.packetsService.getPacketsOutForDelivery(city);
  }

  @UseGuards(JwtAuthGuard)
  @Post('assign-delivery-agent')
  async assignDeliveryAgent(
    @Body('packetId') packetId: number,
    @Body('agentId') agentId: number,
    @Request() req,
  ): Promise<Packet> {
    return this.packetsService.assignDeliveryAgent(packetId, agentId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('unassign-delivery-agent')
  async unassignDeliveryAgent(
    @Body('packetId') packetId: number,
    @Request() req,
  ): Promise<Packet> {
    return this.packetsService.unassignDeliveryAgent(packetId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('confirm-delivery')
  async confirmDelivery(
    @Body('packetId') packetId: number,
    @Request() req,
  ): Promise<Packet> {
    return this.packetsService.confirmDelivery(packetId, req.user);
  }

  // get agent's packets to be collected or assingned
  @Get('agents/:id/assigned-packets')
  async getAssignedPackets(@Param('id') id: string) {
    const agentId = parseInt(id);
    if (isNaN(agentId)) {
      throw new BadRequestException('Invalid agent ID');
    }
    return this.packetsService.getAssignedPacketsForAgent(agentId);
  }

  // get packets to be delivered by the agent
  @Get('agents/:id/packets-deliver')
  async getPacketsToDeliver(@Param('id') id: string) {
    const agentId = parseInt(id);
    if (isNaN(agentId)) {
      throw new BadRequestException('Invalid agent ID');
    }
    return this.packetsService.getAssignedPacketsForDeliveryAgent(agentId);
  }

  // paid packets
  @Patch(':id/mark-as-paid')
  @UseGuards(JwtAuthGuard)
  async markAsPaid(@Param('id') id: string): Promise<Packet> {
    return this.packetsService.markAsPaid(parseInt(id));
  }
}
