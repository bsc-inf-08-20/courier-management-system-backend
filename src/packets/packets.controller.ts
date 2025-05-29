import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  NotFoundException,
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
import { EmailService } from '../email/email.service';

@Controller('packets')
export class PacketsController {
  constructor(
    private readonly packetsService: PacketsService,
    private readonly emailService: EmailService,
  ) {}

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

  @Patch(':id/mark-delivered')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  async markAsDelivered(
    @Param('id') id: string,
    @Body('signature_base64') signatureBase64: string,
    @Body('nationalId') nationalId: string,
    @Request() req,
  ) {
    return this.packetsService.markAsDelivered(
      parseInt(id),
      signatureBase64,
      nationalId,
    );
  }

  // this does also mark the packet as delivered
  @Patch(':id/picked')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async picked(
    @Param('id') id: string,
    @Body('signature_base64') signatureBase64: string,
    @Body('nationalId') nationalId: string,
    @Request() req,
  ) {
    return this.packetsService.picked(
      parseInt(id),
      signatureBase64,
      nationalId,
    );
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
  @Get('delivered')
  async getDeliveredPackets(@Query('city') city: string): Promise<Packet[]> {
    return this.packetsService.getDeliveredPackets(city);
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

  // get packets for delivery agent
  @Get('delivery-agent/packets')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  async getDeliveryAgentPackets(@Request() req) {
    return this.packetsService.getDeliveryAgentPackets(req.user.user_id);
  }

  // get packets that have been delivered
  // needs to be implemented

  //agent delivery packet to customer - email notification
  @Post('notifications/delivery-confirmation')
  @UseGuards(JwtAuthGuard)
  async sendDeliveryConfirmation(@Body('packetId') packetId: number) {
    const packet = await this.packetsService.getPacketById(packetId);
    if (!packet) {
      throw new NotFoundException('Packet not found');
    }

    if (packet.status !== 'delivered') {
      throw new BadRequestException('Packet is not delivered yet');
    }

    await this.emailService.sendDeliveryConfirmationToSender(
      packet.sender.email,
      {
        trackingId: packet.id.toString(),
        recipientName: packet.receiver.name,
        deliveryLocation: packet.destination_address,
        deliveryTime: packet.delivered_at,
      },
    );

    return { message: 'Delivery confirmation email sent successfully' };
  }

  // customer pickup email notification
  @Post('notifications/pickup-confirmation')
  @UseGuards(JwtAuthGuard)
  async sendPickupConfirmation(@Body('packetId') packetId: number) {
    const packet = await this.packetsService.getPacketById(packetId);
    if (!packet) {
      throw new NotFoundException('Packet not found');
    }

    if (packet.status !== 'delivered') {
      throw new BadRequestException('Packet is not delivered yet');
    }

    await this.emailService.sendPickupConfirmationToSender(
      packet.sender.email,
      {
        trackingId: packet.id.toString(),
        recipientName: packet.receiver.name,
        deliveryLocation: packet.destination_address,
        deliveryTime: packet.delivered_at,
      },
    );

    return { message: 'Delivery confirmation email sent successfully' };
  }

  // pickup assignment email notification
  @Post('notifications/pickup-assignment')
  @UseGuards(JwtAuthGuard)
  async sendPickupAssignment(@Body('pickupRequestId') pickupRequestId: number) {
    const pickup =
      await this.packetsService.getPickupRequestById(pickupRequestId);
    if (!pickup) {
      throw new NotFoundException('Pickup request not found');
    }

    if (!pickup.assigned_agent) {
      throw new BadRequestException('No agent assigned to this pickup');
    }

    await this.emailService.sendPickupAssignmentNotification(
      pickup.assigned_agent.email,
      {
        trackingId: pickup.packet.id.toString(),
        pickupLocation: pickup.pickup_address,
        senderName: pickup.customer.name,
        senderContact: pickup.customer.phone_number,
      },
    );

    return { message: 'Pickup assignment notification sent successfully' };
  }

  // delivery assignment email notification
  @Post('notifications/delivery-assignment')
  @UseGuards(JwtAuthGuard)
  async sendDeliveryAssignment(@Body('packetId') packetId: number) {
    const packet = await this.packetsService.getPacketById(packetId);
    if (!packet) {
      throw new NotFoundException('Packet not found');
    }

    if (!packet.assigned_delivery_agent) {
      throw new BadRequestException(
        'No delivery agent assigned to this packet',
      );
    }

    await this.emailService.sendDeliveryAssignmentNotification(
      packet.assigned_delivery_agent.email,
      {
        trackingId: packet.id.toString(),
        deliveryLocation: packet.destination_address,
        recipientName: packet.receiver.name,
        recipientContact: packet.receiver.phone_number,
      },
    );

    return { message: 'Delivery assignment notification sent successfully' };
  }

  @Get('agent/pickup-assignments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  async getAgentPickupAssignments(@Request() req): Promise<Packet[]> {
    return this.packetsService.getAgentPickupAssignments(req.user.user_id);
  }

  @Get('agent/delivery-assignments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.AGENT)
  async getAgentDeliveryAssignments(@Request() req): Promise<Packet[]> {
    return this.packetsService.getAgentDeliveryAssignments(req.user.user_id);
  }

  // Packet arrival at hub email notification
  @Post('notifications/arrival-at-hub')
  @UseGuards(JwtAuthGuard)
  async sendArrivalAtHubNotification(@Body('packetId') packetId: number) {
    const packet = await this.packetsService.getPacketById(packetId);
    if (!packet) throw new NotFoundException('Packet not found');
    if (packet.status !== 'at_destination_hub') {
      throw new BadRequestException('Packet has not arrived at the hub yet');
    }

    await this.emailService.sendArrivalAtHubNotification(
      packet.receiver.email,
      {
        trackingId: packet.trackingId,
        originCity: packet.origin_city,
        destinationHub: packet.destination_hub,
        description: packet.description,
      },
    );

    return { message: 'Arrival at hub notification email sent successfully' };
  }

  // Booking confirmation email notification
  @Post('notifications/booking-confirmation')
  @UseGuards(JwtAuthGuard)
  async sendBookingConfirmation(
    @Body('pickupRequestId') pickupRequestId: number,
  ) {
    // Find the pickup request and packet/entities as needed
    const pickup =
      await this.packetsService.getPickupRequestById(pickupRequestId);
    if (!pickup) throw new NotFoundException('Pickup request not found');
    const packet = pickup.packet;

    await this.emailService.sendBookingConfirmationToSender(
      pickup.customer.email,
      {
        trackingId: packet.trackingId,
        originCity: packet.origin_city,
        destination: packet.destination_address,
        description: packet.description,
      },
    );

    return { message: 'Booking confirmation email sent successfully' };
  }

  // Track a packet by its tracking ID
  @Get('track/:trackingId')
  async trackPacket(@Param('trackingId') trackingId: string) {
    const packet = await this.packetsService.findByTrackingId(trackingId);
    if (!packet) throw new NotFoundException('Packet not found');

    return {
      trackingId: packet.trackingId,
      status: packet.status,
      sender: packet.sender,
      receiver: packet.receiver,
      origin_city: packet.origin_city,
      destination_address: packet.destination_address,
      origin_hub_confirmed_at: packet.origin_hub_confirmed_at,
      dispatched_at: packet.dispatched_at,
      destination_hub_confirmed_at: packet.destination_hub_confirmed_at,
      delivered_at: packet.delivered_at,
      pending_at: packet.created_at,
      collected_at: packet.collected_at,
      out_for_delivery_at: packet.out_for_delivery_at,
    };
  }

  // Send packet receipt to both sender and receiver
  @Post('notifications/send-packet-receipt')
  async sendPacketReceiptToSenderAndReceiver(@Body() body: any) {
    // body should contain all receipt details and both emails
    const { sender, receiver, ...receiptDetails } = body;

    await this.emailService.sendPacketReceipt(sender.email, {
      ...receiptDetails,
      sender,
      receiver,
    });
    await this.emailService.sendPacketReceipt(receiver.email, {
      ...receiptDetails,
      sender,
      receiver,
    });

    return { message: 'Receipt sent to both sender and receiver' };
  }
}
