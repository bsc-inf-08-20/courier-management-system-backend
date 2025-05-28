import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Not, Repository } from 'typeorm';
import { Packet } from 'src/entities/Packet.entity';
import { User } from 'src/entities/User.entity';
import { Vehicle } from 'src/entities/Vehicle.entity';
import { Role } from 'src/enum/role.enum';
import { CreatePacketDto } from 'src/dto/create-packet.dto';
import { PickupRequest } from 'src/entities/PickupRequest.entity';

@Injectable()
export class PacketsService {
  constructor(
    @InjectRepository(Packet)
    private readonly packetRepository: Repository<Packet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    @InjectRepository(PickupRequest)
    private readonly pickupRequestRepository: Repository<PickupRequest>,
  ) {}

  //create packet from admin's panel
  // async createPacket(packetData: Partial<Packet>, admin: any): Promise<Packet> {
  //   // Prepare the packet data with default values and validation
  //   const packet = this.packetRepository.create({
  //     description: packetData.description || '',
  //     weight: packetData.weight || 0,
  //     category: packetData.category || 'other',
  //     instructions: packetData.instructions || '',
  //     origin_city: packetData.origin_city || '',
  //     origin_coordinates: packetData.origin_coordinates || { lat: 0, lng: 0 },
  //     destination_address: packetData.destination_address || '',
  //     destination_coordinates: packetData.destination_coordinates || { lat: 0, lng: 0 },
  //     delivery_type: packetData.delivery_type || 'pickup',
  //     destination_hub: packetData.destination_hub || '',
  //     sender: packetData.sender || { name: '', email: '', phone_number: '' },
  //     receiver: packetData.receiver || { name: '', email: '', phone_number: '' },
  //     status: packetData.status || 'pending', // Default to 'pending', but can be overridden
  //   });

  //   // Save the packet to the database
  //   const savedPacket = await this.packetRepository.save(packet);

  //   return savedPacket;
  // }

  async createPacket(packetData: CreatePacketDto): Promise<Packet> {
    // Convert weight to number
    const weight = parseFloat(packetData.weight);

    // Create packet with exact data (no defaults)
    const packet = this.packetRepository.create({
      ...packetData,
      weight,
      status: 'at_origin_hub', // Only default we want
    });

    return this.packetRepository.save(packet);
  }

  // Fetch all packets from DB
  async getAllPackets(): Promise<Packet[]> {
    return this.packetRepository.find();
  }

  //comfirm dispatch
  async confirmPacketDispatch(packetId: number) {
    const packet = await this.packetRepository.findOne({
      where: { id: packetId },
    });

    if (!packet) throw new NotFoundException('Packet not found');

    // ✅ Only confirm if the packet is still pending
    if (packet.status !== 'pending')
      throw new ConflictException('Packet already confirmed or delivered');

    packet.confirmed_by_origin = true;
    return this.packetRepository.save(packet);
  }

  // get packets based on the city of the admin (origin and destination<after confirmed>)
  async getPacketsForAdmin(adminId: number): Promise<Packet[]> {
    const admin = await this.userRepository.findOne({
      where: { user_id: adminId },
      select: ['city'],
    });

    if (!admin) throw new NotFoundException('Admin not found');

    return this.packetRepository.find({
      where: [
        {
          origin_city: Like(`%${admin.city}%`),
          status: Not('received'), // Show all packets from their city
        },
        {
          destination_address: Like(`%${admin.city}%`),
          status: 'at_destination_hub', // Only show incoming packets when they reach the hub
        },
      ],
      relations: ['pickup', 'pickup.customer', 'pickup.assigned_agent'],
    });
  }

  async updateWeight(id: number, weight: number): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id });
    if (!packet) {
      throw new Error('Packet not found');
    }

    packet.weight = weight;
    return this.packetRepository.save(packet);
  }

  async agentConfirmCollection(id: number, weight?: number): Promise<Packet> {
    // const packet = await this.packetRepository.findOneBy({ id });

    const packet = await this.packetRepository.findOne({
      where: { id: id },
      relations: ['pickup'], // Include relations if needed
    });

    if (!packet) {
      throw new Error('Packet not found');
    }

    if (weight) {
      packet.weight = weight;
    }
    packet.status = 'collected';

    packet.collected_at = new Date();

    return this.packetRepository.save(packet);
  }

  async adminConfirmAtHub(packetId: number): Promise<Packet> {
    const packet = await this.packetRepository.findOne({
      where: { id: packetId },
      relations: ['pickup'], // Include relations if needed
    });

    if (!packet) {
      throw new NotFoundException('Packet not found');
    }

    // Enhanced validation
    if (packet.status !== 'collected') {
      throw new ConflictException(
        `Packet must be in 'collected' status. Current status: ${packet.status}`,
      );
    }

    // Use the exact enum value
    packet.status = 'at_origin_hub'; // Changed from 'at_hub'
    packet.origin_hub_confirmed_at = new Date();

    try {
      const savedPacket = await this.packetRepository.save(packet);
      console.log('Saved packet:', savedPacket); // Debug log
      return savedPacket;
    } catch (error) {
      console.error('Error saving packet:', error);
      throw new InternalServerErrorException('Failed to update packet status');
    }
  }

  async adminDispatchForTransport(packetId: number): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id: packetId });
    if (!packet) throw new NotFoundException('Packet not found');
    if (packet.status !== 'at_origin_hub') {
      throw new ConflictException('Packet must be at hub first');
    }

    packet.status = 'in_transit';
    packet.confirmed_by_origin = true;
    packet.dispatched_at = new Date();
    return this.packetRepository.save(packet);
  }

  async confirmAtDestinationHub(packetId: number): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id: packetId });
    if (!packet) throw new NotFoundException('Packet not found');
    if (packet.status !== 'in_transit') {
      throw new ConflictException('Packet must be in transit first');
    }

    packet.status = 'at_destination_hub';
    packet.destination_hub_confirmed_at = new Date();
    return this.packetRepository.save(packet);
  }

  async markOutForDelivery(packetId: number): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id: packetId });
    if (!packet) throw new NotFoundException('Packet not found');
    if (packet.status !== 'at_destination_hub') {
      throw new ConflictException('Packet must be at destination hub first');
    }

    packet.status = 'out_for_delivery';
    packet.out_for_delivery_at = new Date();
    return this.packetRepository.save(packet);
  }

  async markAsDelivered(
    packetId: number,
    signatureBase64: string,
  ): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id: packetId });
    if (!packet) {
      throw new NotFoundException('Packet not found');
    }

    if (packet.status !== 'out_for_delivery') {
      throw new ConflictException('Packet must be out for delivery first');
    }

    packet.status = 'delivered';
    packet.delivered_at = new Date();
    packet.signature_base64 = signatureBase64; // Save the signature

    return this.packetRepository.save(packet);
  }

  // marked as delivered when picked
  async picked(packetId: number, signatureBase64: string): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id: packetId });
    if (!packet) {
      throw new NotFoundException('Packet not found');
    }

    packet.status = 'delivered';
    packet.delivered_at = new Date();
    packet.signature_base64 = signatureBase64; // Save the signature

    return this.packetRepository.save(packet);
  }

  async confirmReceiverReceived(packetId: number): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id: packetId });
    if (!packet) throw new NotFoundException('Packet not found');
    if (packet.status !== 'delivered') {
      throw new ConflictException('Packet must be delivered first');
    }

    packet.status = 'received';
    return this.packetRepository.save(packet);
  }

  async dispatchBatch(
    packetIds: number[],
    driverId: number,
    vehicleId: number,
  ): Promise<Packet[]> {
    // Use the In operator to find packets by their IDs
    const packets = await this.packetRepository.find({
      where: { id: In(packetIds) },
    });
    if (packets.length !== packetIds.length) {
      throw new NotFoundException('One or more packets not found');
    }

    const driver = await this.userRepository.findOne({
      where: { user_id: driverId, role: Role.DRIVER },
    });
    if (!driver) throw new NotFoundException('Driver not found');

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId },
    });
    if (!vehicle || !vehicle.is_active || vehicle.is_in_maintenance) {
      throw new NotFoundException('Vehicle not found or unavailable');
    }

    const totalWeight = packets.reduce((sum, p) => sum + p.weight, 0);
    if (totalWeight > vehicle.capacity) {
      throw new BadRequestException(
        `Total weight (${totalWeight}kg) exceeds vehicle capacity (${vehicle.capacity}kg)`,
      );
    }

    for (const packet of packets) {
      if (packet.status !== 'at_origin_hub') {
        throw new BadRequestException(
          `Packet ${packet.id} is not ready for dispatch`,
        );
      }
      packet.status = 'in_transit';
      packet.confirmed_by_origin = true;
      packet.assigned_driver = driver;
      packet.assigned_vehicle = vehicle;
      packet.dispatched_at = new Date();
    }

    vehicle.assigned_driver = driver;
    await this.vehicleRepository.save(vehicle);
    return this.packetRepository.save(packets);
  }

  // async getPacketsAtOriginHub(city: string) {
  //   return this.packetRepository.find({
  //     where: {
  //       status: 'at_origin_hub',
  //       origin_city: Like(`%${city}%`),
  //       // confirmed_by_origin: true, // Only show confirmed packets
  //     },
  //     relations: [
  //       'pickup',
  //       'pickup.customer',
  //       'assigned_driver',
  //       'assigned_vehicle',
  //     ],
  //     order: {
  //       origin_hub_confirmed_at: 'DESC', // Show most recently confirmed first
  //     },
  //   });
  // }

  async getPacketsInTransitFromOrigin(origin: string) {
    return this.packetRepository.find({
      where: {
        status: 'in_transit',
        origin_city: Like(`%${origin}%`),
      },
      relations: [
        'pickup',
        'pickup.customer',
        'assigned_driver',
        'assigned_vehicle',
      ],
      order: {
        dispatched_at: 'DESC',
      },
    });
  }

  async getPacketsInTransitIcoming(origin: string) {
    return this.packetRepository.find({
      where: {
        status: 'in_transit',
        destination_address: Like(`%${origin}%`),
      },
      relations: [
        'pickup',
        'pickup.customer',
        'assigned_vehicle', // This gets the vehicle
        'assigned_vehicle.assigned_driver',
      ],
      order: {
        dispatched_at: 'DESC',
      },
    });
  }

  //Dealing with dispatching

  async assignPacketToVehicle(
    packetId: number,
    vehicleId: number,
    admin: User,
  ): Promise<Packet> {
    if (admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can assign packets');
    }

    const packet = await this.packetRepository.findOne({
      where: { id: packetId, status: 'at_origin_hub' },
    });
    if (!packet)
      throw new NotFoundException(
        'Packet not found or not ready for assignment',
      );

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, is_active: true, is_in_maintenance: false },
      relations: ['assigned_packets'],
    });
    if (!vehicle)
      throw new NotFoundException('Vehicle not found or unavailable');

    // Extract destination city from packet's destination_address (assuming format includes city)
    const packetDestinationCity = packet.destination_address
      .split(',')
      .pop()
      ?.trim();
    if (
      vehicle.destination_city &&
      vehicle.destination_city !== packetDestinationCity
    ) {
      throw new BadRequestException(
        `Vehicle is assigned to ${vehicle.destination_city}, but packet is going to ${packetDestinationCity}`,
      );
    }

    const newLoad = vehicle.current_load + packet.weight;
    if (newLoad > vehicle.capacity) {
      throw new BadRequestException(
        `Adding packet (${packet.weight}kg) exceeds vehicle capacity. Current: ${vehicle.current_load}kg, Capacity: ${vehicle.capacity}kg`,
      );
    }

    // Set destination city if not set
    if (!vehicle.destination_city) {
      vehicle.destination_city = packetDestinationCity;
    }

    packet.assigned_vehicle = vehicle;
    vehicle.current_load = newLoad;

    await this.vehicleRepository.save(vehicle);
    return this.packetRepository.save(packet);
  }

  async assignMultiplePacketsToVehicle(
    packetIds: number[],
    vehicleId: number,
    admin: User,
  ): Promise<Packet[]> {
    if (admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can assign packets');
    }

    const packets = await this.packetRepository.find({
      where: { id: In(packetIds), status: 'at_origin_hub' },
    });
    if (packets.length !== packetIds.length) {
      throw new NotFoundException(
        'One or more packets not found or not ready for assignment',
      );
    }

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, is_active: true, is_in_maintenance: false },
      relations: ['assigned_packets'],
    });
    if (!vehicle)
      throw new NotFoundException('Vehicle not found or unavailable');

    const packetDestinationCities = packets.map((p) =>
      p.destination_address.split(',').pop()?.trim(),
    );
    const uniqueDestinations = [...new Set(packetDestinationCities)];
    if (uniqueDestinations.length > 1) {
      throw new BadRequestException(
        'All packets must have the same destination city',
      );
    }

    const packetDestinationCity = uniqueDestinations[0];
    if (
      vehicle.destination_city &&
      vehicle.destination_city !== packetDestinationCity
    ) {
      throw new BadRequestException(
        `Vehicle is assigned to ${vehicle.destination_city}, but packets are going to ${packetDestinationCity}`,
      );
    }

    const totalWeight = packets.reduce((sum, p) => sum + p.weight, 0);
    const newLoad = vehicle.current_load + totalWeight;
    if (newLoad > vehicle.capacity) {
      throw new BadRequestException(
        `Adding packets (${totalWeight}kg) exceeds vehicle capacity. Current: ${vehicle.current_load}kg, Capacity: ${vehicle.capacity}kg`,
      );
    }

    if (!vehicle.destination_city) {
      vehicle.destination_city = packetDestinationCity;
    }

    vehicle.current_load = newLoad;
    packets.forEach((packet) => {
      packet.assigned_vehicle = vehicle;
    });

    await this.vehicleRepository.save(vehicle);
    return this.packetRepository.save(packets);
  }

  async getAvailableVehicles(city: string): Promise<Vehicle[]> {
    return this.vehicleRepository.find({
      where: {
        current_city: city,
        is_active: true,
        is_in_maintenance: false,
        status: 'available', // Only return available vehicles
      },
      relations: ['assigned_packets', 'assigned_driver'],
    });
  }

  async dispatchVehicle(vehicleId: number, admin: User): Promise<Vehicle> {
    if (admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can dispatch vehicles');
    }

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: vehicleId, is_active: true, is_in_maintenance: false },
      relations: ['assigned_packets'],
    });
    if (!vehicle)
      throw new NotFoundException('Vehicle not found or unavailable');
    if (!vehicle.assigned_packets || vehicle.assigned_packets.length === 0) {
      throw new BadRequestException(
        'Vehicle has no assigned packets to dispatch',
      );
    }

    vehicle.assigned_packets.forEach((packet) => {
      packet.status = 'in_transit';
      packet.dispatched_at = new Date();
      packet.confirmed_by_origin = true;
    });

    vehicle.status = 'in_transit'; // Set vehicle status to in_transit

    await this.packetRepository.save(vehicle.assigned_packets);
    await this.vehicleRepository.save(vehicle);
    return vehicle;
  }

  // Update existing method to include assigned_vehicle relation
  async getPacketsAtOriginHub(city: string) {
    return this.packetRepository.find({
      where: {
        status: 'at_origin_hub',
        origin_city: Like(`%${city}%`),
      },
      relations: ['pickup', 'pickup.customer', 'assigned_vehicle'],
      order: {
        origin_hub_confirmed_at: 'DESC',
      },
    });
  }

  async unassignPacketFromVehicle(
    packetId: number,
    admin: User,
  ): Promise<Packet> {
    if (admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can unassign packets');
    }

    const packet = await this.packetRepository.findOne({
      where: { id: packetId, status: 'at_origin_hub' },
      relations: ['assigned_vehicle'],
    });
    if (!packet)
      throw new NotFoundException(
        'Packet not found or not in a state to unassign',
      );

    if (!packet.assigned_vehicle) {
      throw new BadRequestException('Packet is not assigned to any vehicle');
    }

    const vehicle = await this.vehicleRepository.findOne({
      where: { id: packet.assigned_vehicle.id },
      relations: ['assigned_packets'],
    });
    if (!vehicle) throw new NotFoundException('Assigned vehicle not found');

    // Update vehicle's current load
    vehicle.current_load -= packet.weight;

    // If no packets remain, clear the destination city
    const remainingPackets = vehicle.assigned_packets.filter(
      (p) => p.id !== packetId,
    );
    if (remainingPackets.length === 0) {
      vehicle.destination_city = null;
    }

    // Unassign the packet
    packet.assigned_vehicle = null;

    await this.vehicleRepository.save(vehicle);
    return this.packetRepository.save(packet);
  }

  //HANDLING RECEIVING PACKET
  // Fetch packets at the destination hub (ready for delivery agent assignment)
  async getPacketsAtDestinationHub(city: string): Promise<Packet[]> {
    return this.packetRepository.find({
      where: {
        status: 'at_destination_hub',
        destination_address: Like(`%${city}%`),
      },
      relations: ['assigned_delivery_agent'],
    });
  }

  // Fetch packets out for delivery (already assigned to a delivery agent)
  async getPacketsOutForDelivery(city: string): Promise<Packet[]> {
    return this.packetRepository.find({
      where: {
        status: 'out_for_delivery',
        destination_address: Like(`%${city}%`),
        assigned_delivery_agent: { city },
      },
      relations: ['assigned_delivery_agent'],
    });
  }

  // Fetch packets delivered (already delivered)
  async getDeliveredPackets(city: string): Promise<Packet[]> {
    return this.packetRepository.find({
      where: {
        status: 'delivered',
        destination_address: Like(`%${city}%`),
      },
      relations: ['assigned_delivery_agent'],
    });
  }

  // Assign a delivery agent to a packet
  async assignDeliveryAgent(
    packetId: number,
    agentId: number,
    admin: User,
  ): Promise<Packet> {
    if (admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can assign delivery agents');
    }

    const packet = await this.packetRepository.findOne({
      where: { id: packetId, status: 'at_destination_hub' },
      relations: ['assigned_delivery_agent'],
    });
    if (!packet) {
      throw new NotFoundException('Packet not found or not ready for delivery');
    }

    const agent = await this.userRepository.findOne({
      where: { user_id: agentId, role: Role.AGENT },
    });
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    packet.assigned_delivery_agent = agent;
    packet.status = 'out_for_delivery';
    packet.out_for_delivery_at = new Date();

    return this.packetRepository.save(packet);
  }

  // Unassign a delivery agent from a packet
  async unassignDeliveryAgent(packetId: number, admin: User): Promise<Packet> {
    if (admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can unassign delivery agents');
    }

    const packet = await this.packetRepository.findOne({
      where: { id: packetId, status: 'out_for_delivery' },
      relations: ['assigned_delivery_agent'],
    });
    if (!packet) {
      throw new NotFoundException('Packet not found or not out for delivery');
    }

    packet.assigned_delivery_agent = null;
    packet.status = 'at_destination_hub';
    // packet.out_for_delivery_at = null;

    return this.packetRepository.save(packet);
  }

  // Confirm delivery of a packet
  async confirmDelivery(packetId: number, admin: User): Promise<Packet> {
    if (admin.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can confirm delivery');
    }

    const packet = await this.packetRepository.findOne({
      where: { id: packetId, status: 'out_for_delivery' },
      relations: ['assigned_delivery_agent'],
    });
    if (!packet) {
      throw new NotFoundException('Packet not found or not out for delivery');
    }

    packet.status = 'delivered';
    packet.delivered_at = new Date();
    packet.assigned_delivery_agent = null; // Clear the assigned agent after delivery

    return this.packetRepository.save(packet);
  }

  // fetches all packets assigned to a specific agent (either as pickup or delivery agent)
  async findByAgent(agentId: number): Promise<Packet[]> {
    return this.packetRepository.find({
      where: [
        { assigned_pickup_agent: { user_id: agentId } },
        { assigned_delivery_agent: { user_id: agentId } },
      ],
      relations: [
        'assigned_pickup_agent',
        'assigned_delivery_agent',
        'assigned_vehicle',
        'pickup',
      ],
      order: {
        status: 'ASC', // Optional: order by status
        collected_at: 'DESC', // Optional: newest first
      },
    });
  }

  //get the packets coordinates
  async getPacketOriginCoordinates(packetId: number) {
    console.log('Searching for packet ID:', packetId);
    const packet = await this.packetRepository.findOne({
      where: { id: packetId },
    });

    console.log('Found packet:', packet);

    if (!packet) throw new NotFoundException('Packet not found');

    if (!packet.origin_coordinates) {
      console.warn('Packet found but origin_coordinates is null/undefined');
    }

    return packet.origin_coordinates;
  }

  async getPacketDestinationCoordinates(packetId: number) {
    const packet = await this.packetRepository.findOne({
      where: { id: packetId },
      select: ['destination_coordinates'],
    });

    if (!packet) throw new NotFoundException('Packet not found');
    return packet.destination_coordinates;
  }

  // get assigned packets for agent for pickup
  async getAssignedPacketsForAgent(agentId: number): Promise<Packet[]> {
    return this.packetRepository
      .createQueryBuilder('packet')
      .leftJoinAndSelect('packet.assigned_pickup_agent', 'agent')
      .where('agent.user_id = :agentId', { agentId })
      .andWhere('packet.status = :status', { status: 'pending' }) // Explicitly check for 'pending'
      .select([
        'packet.id',
        'packet.description',
        'packet.origin_coordinates',
        'packet.status',
        'agent.user_id',
      ])
      .getMany();
  }

  // get assigned packets for agent for delivery
  async getAssignedPacketsForDeliveryAgent(agentId: number): Promise<Packet[]> {
    return this.packetRepository
      .createQueryBuilder('packet')
      .leftJoinAndSelect('packet.assigned_delivery_agent', 'agent')
      .where('agent.user_id = :agentId', { agentId })
      .andWhere('packet.status = :status', { status: 'out_for_delivery' }) // Explicitly check for 'out_for_delivery'
      .select([
        'packet.id',
        'packet.description',
        'packet.destination_coordinates',
        'packet.status',
        'agent.user_id',
      ])
      .getMany();
  }

  async updatePacketStatus(packetId: number, status: string) {
    await this.packetRepository.update(packetId, { status });
  }

  // Mark a packet as paid
  async markAsPaid(packetId: number): Promise<Packet> {
    const packet = await this.packetRepository.findOne({
      where: { id: packetId },
    });

    if (!packet) {
      throw new NotFoundException('Packet not found');
    }

    if (packet.is_paid) {
      throw new ConflictException('Packet is already marked as paid');
    }

    packet.is_paid = true;
    return this.packetRepository.save(packet);
  }

  async getDeliveryAgentPackets(agentId: number): Promise<any[]> {
    const packets = await this.packetRepository.find({
      where: {
        assigned_delivery_agent: { user_id: agentId },
        status: 'out_for_delivery',
        delivery_type: 'delivery',
      },
      select: [
        'id',
        'destination_coordinates',
        'category',
        'created_at',
        'receiver',
      ],
      relations: ['assigned_delivery_agent'],
    });

    // Transform the data to return only needed fields
    return packets.map((packet) => ({
      id: packet.id,
      destination_coordinates: packet.destination_coordinates,
      category: packet.category,
      sent_date: packet.created_at,
      customer: {
        name: packet.receiver.name,
        phone_number: packet.receiver.phone_number,
      },
      status: packet.status,
      signature_base64: packet.signature_base64 || null, // Include signature if available
    }));
  }

  // Add this method to PacketsService
  async getPacketById(id: number): Promise<Packet> {
    const packet = await this.packetRepository.findOne({
      where: { id },
      relations: [
        'assigned_delivery_agent', // Make sure this relation is loaded
      ],
    });

    if (!packet) {
      throw new NotFoundException(`Packet with ID ${id} not found`);
    }

    return packet;
  }

  async getPickupRequestById(id: number): Promise<PickupRequest> {
    const pickupRequest = await this.pickupRequestRepository.findOne({
      where: { id },
      relations: ['assigned_agent', 'packet', 'customer'],
    });

    if (!pickupRequest) {
      throw new NotFoundException(`Pickup request with ID ${id} not found`);
    }

    return pickupRequest;
  }
}
