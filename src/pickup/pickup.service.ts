import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PickupRequest } from '../entities/PickupRequest.entity';
import { CreatePacketDto } from 'src/dto/pickup-request.dto';
import { User } from '../entities/User.entity';
import { Role } from 'src/enum/role.enum';
import { Packet } from 'src/entities/Packet.entity';

@Injectable()
export class PickupService {
  constructor(
    @InjectRepository(PickupRequest)
    private pickupRepository: Repository<PickupRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Packet)
    private packetRepository: Repository<Packet>,
  ) {}

  //  Add packets when booking a pickup
  async requestPickup(customerId: number, pickupData: CreatePacketDto) {
    const customer = await this.userRepository.findOne({
      where: { user_id: customerId },
    });

    if (!customer) throw new Error('Customer not found');

    const packet = this.packetRepository.create({
      description: pickupData.packet_description,
      weight: pickupData.packet_weight,
      category: pickupData.packet_category,
      instructions: pickupData.instructions,
      status: 'pending',
      delivery_type: pickupData.delivery_type,
      origin_address: pickupData.pickup_address,
      destination_address: pickupData.destination_address,
      destination_hub: pickupData.destination_hub,
      sender: {
        name: pickupData.sender.name,
        email: pickupData.sender.email,
        phone_number: pickupData.sender.phone_number,
      },
      receiver: {
        name: pickupData.receiver.name,
        email: pickupData.receiver.email,
        phone_number: pickupData.receiver.phone_number,
      },
      origin_coordinates: {
        lat: pickupData.origin_coordinates.lat,
        lng: pickupData.origin_coordinates.lng,
      },
      destination_coordinates: {
        lat: pickupData.destination_coordinates.lat,
        lng: pickupData.destination_coordinates.lng,
      },

      pickup_window_start: new Date(pickupData.pickup_window.start),
      pickup_window_end: new Date(pickupData.pickup_window.end),
    });

    const savedPacket = await this.packetRepository.save(packet);

    const pickupRequest = this.pickupRepository.create({
      customer,
      pickup_address: pickupData.pickup_address,
      destination_address: pickupData.destination_address,
      packet: savedPacket,
      status: 'pending',
    });

    return this.pickupRepository.save(pickupRequest);
  }

  //  Ensure the customer can only view their own packets
  async getPacketsByPickup(
    pickupId: number,
    customerId: number,
  ): Promise<Packet[]> {
    const pickup = await this.pickupRepository.findOne({
      where: { id: pickupId },
      relations: ['customer'],
    });

    if (!pickup) {
      throw new NotFoundException('Pickup request not found');
    }

    if (pickup.customer.user_id !== customerId) {
      throw new ForbiddenException(
        'You do not have permission to view these packets',
      );
    }

    return this.packetRepository.find({ where: { pickup: { id: pickupId } } });
  }

  //get specific requests for specific agent
  async getAssignedRequestsForAgent(agentId: number): Promise<PickupRequest[]> {
    if (!agentId || isNaN(agentId)) {
      throw new BadRequestException('Invalid agent ID');
    }

    return this.pickupRepository.find({
      where: {
        status: 'assigned',
        assigned_agent: { user_id: agentId },
        packet: {
          status: Not('collected'),
        },
      },
      relations: ['customer', 'assigned_agent', 'packet'],
    });
  }

  async assignAgent(
    requestId: number,
    agentId: number,
    adminId: number,
  ): Promise<PickupRequest> {
    const [pickupRequest, agent, admin] = await Promise.all([
      this.pickupRepository.findOne({
        where: { id: requestId },
        relations: ['packet', 'assigned_agent'], // Ensure packet is loaded
      }),
      this.userRepository.findOne({
        where: { user_id: agentId },
      }),
      this.userRepository.findOne({
        where: { user_id: adminId },
      }),
    ]);

    if (!pickupRequest) throw new NotFoundException('Pickup request not found');
    if (!agent || agent.role !== Role.AGENT)
      throw new NotFoundException('Agent not found');
    if (!admin) throw new NotFoundException('Admin not found');

    // Verify packet is from admin's city
    if (!pickupRequest.packet.origin_address.includes(admin.city)) {
      throw new ForbiddenException(
        'You can only assign agents to packets from your city',
      );
    }

    // Verify agent is from the same city
    if (agent.city !== admin.city) {
      throw new ForbiddenException('You can only assign agents from your city');
    }

    // Assign agent to the PickupRequest
    pickupRequest.assigned_agent = agent;
    pickupRequest.status = 'assigned';

    // Assign agent to the Packet as assigned_driver
    pickupRequest.packet.assigned_pickup_agent = agent;

    // Save the PickupRequest (this will cascade to the Packet due to eager: true and cascade: true)
    return this.pickupRepository.save(pickupRequest);
  }

  // Agent views assigned pickups
  async getAgentPickups(agentId: number): Promise<PickupRequest[]> {
    return this.pickupRepository.find({
      where: { assigned_agent: { user_id: agentId } },
    });
  }

  async markAsDelivered(
    pickupId: number,
    agentId: number,
  ): Promise<PickupRequest> {
    const pickup = await this.pickupRepository.findOne({
      where: { id: pickupId },
      relations: ['assigned_agent', 'packet'], // Add 'packet' to relations
    });

    if (!pickup) {
      throw new NotFoundException('Pickup request not found');
    }

    // if (!pickup.assigned_agent || pickup.assigned_agent.user_id !== agentId) {
    //   throw new ForbiddenException('You are not assigned to this pickup');
    // }

    // Update pickup request status
    pickup.status = 'at_origin_hub';

    // Update related packet status if it exists
    if (pickup.packet) {
      pickup.packet.status = 'at_origin_hub';
      pickup.packet.origin_hub_confirmed_at = new Date();
      await this.packetRepository.save(pickup.packet);
    }

    return this.pickupRepository.save(pickup);
  }

  async getAllPickupRequests(): Promise<PickupRequest[]> {
    return this.pickupRepository.find({
      relations: ['customer', 'assigned_agent', 'packet'], // Include related entities
    });
  }

  async getPickupRequestsByCity(city: string) {
    if (!city) {
      throw new BadRequestException('City is required');
    }

    return this.pickupRepository.find({
      where: { pickup_address: city },
      relations: ['customer', 'assigned_agent', 'packet'],
    });
  }

  async unassignAgent(requestId: number): Promise<PickupRequest> {
    const pickupRequest = await this.pickupRepository.findOne({
      where: { id: requestId },
      relations: ['assigned_agent'],
    });

    if (!pickupRequest) {
      throw new NotFoundException(
        `Pickup request with ID ${requestId} not found`,
      );
    }

    if (!pickupRequest.assigned_agent) {
      throw new ForbiddenException(
        'No agent is currently assigned to this pickup',
      );
    }

    pickupRequest.assigned_agent = null;
    pickupRequest.status = 'pending';

    return this.pickupRepository.save(pickupRequest);
  }
}
