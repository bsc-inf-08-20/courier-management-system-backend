import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PickupRequest } from '../entities/PickupRequest.entity';
import { PickupRequestDto } from '../dto/pickup-request.dto';
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

  // ✅ Add packets when booking a pickup
  async requestPickup(
    customerId: number,
    pickupData: any,
  ): Promise<PickupRequest> {
    const customer = await this.userRepository.findOne({
      where: { user_id: customerId },
    });

    console.log(customer, customer?.user_id);

    if (!customer) throw new Error('Customer not found');

    // ✅ Create the packet with origin & destination based on pickup details
    const packet = this.packetRepository.create({
      description: pickupData.packet_description,
      weight: pickupData.packet_weight,
      category: pickupData.packet_category,
      status: 'pending',
      origin_address: pickupData.pickup_address, // ✅ Set origin from pickup address
      destination_address: pickupData.destination_address, // ✅ Set destination
    });

    const savedPacket = await this.packetRepository.save(packet);

    // ✅ Create the pickup request and link the packet
    const pickupRequest = this.pickupRepository.create({
      customer,
      pickup_address: pickupData.pickup_address,
      destination_address: pickupData.destination_address,
      packet: savedPacket, // ✅ Link the single packet to this pickup request
      status: 'pending',
    });

    return this.pickupRepository.save(pickupRequest);
  }

  // ✅ Ensure the customer can only view their own packets
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

  // Admin assigns an agent based on location
  // async assignAgent(pickupId: number): Promise<PickupRequest> {
  //   const pickup = await this.pickupRepository.findOne({
  //     where: { id: pickupId },
  //     relations: ['packet'],
  //   });

  //   if (!pickup) {
  //     throw new NotFoundException('Pickup request not found');
  //   }

  //   // ✅ Find an agent whose address matches the pickup address
  //   const agent = await this.userRepository.findOne({
  //     where: { role: Role.AGENT, address: pickup.pickup_address },
  //   });

  //   if (!agent) {
  //     throw new NotFoundException('No available agent for this location');
  //   }

  //   // ✅ Assign the agent to the pickup request
  //   pickup.assigned_agent = agent;
  //   pickup.status = 'assigned';

  //   await this.packetRepository.save(pickup.packet); // ✅ Save packet changes
  //   return this.pickupRepository.save(pickup);
  // }

  // async assignAgent(requestId: number, agentId: number) {
  //   const pickupRequest = await this.pickupRepository.findOne({
  //     where: { id: requestId },
  //     relations: ['assigned_agent'], // Ensure we include the agent relation
  //   });

  //   if (!pickupRequest) {
  //     throw new NotFoundException(
  //       `Pickup request with ID ${requestId} not found`,
  //     );
  //   }

  //   const agent = await this.userRepository.findOne({
  //     where: { user_id: agentId, role: Role.AGENT },
  //   });

  //   if (!agent) {
  //     throw new NotFoundException(
  //       `Agent with ID ${agentId} not found or is not an agent`,
  //     );
  //   }

  //   pickupRequest.assigned_agent = agent;
  //   pickupRequest.status = 'assigned';

  //   await this.pickupRepository.save(pickupRequest);

  //   return {
  //     message: 'Agent assigned successfully',
  //     pickup_request: pickupRequest,
  //   };
  // }

  async assignAgent(requestId: number, agentId: number, adminId: number): Promise<PickupRequest> {
    const [pickupRequest, agent, admin] = await Promise.all([
      this.pickupRepository.findOne({
        where: { id: requestId },
        relations: ['packet', 'assigned_agent']
      }),
      this.userRepository.findOne({
        where: { user_id: agentId }
      }),
      this.userRepository.findOne({
        where: { user_id: adminId }
      })
    ]);
  
    if (!pickupRequest) throw new NotFoundException('Pickup request not found');
    if (!agent || agent.role !== Role.AGENT) throw new NotFoundException('Agent not found');
    if (!admin) throw new NotFoundException('Admin not found');
  
    // Verify packet is from admin's city
    if (!pickupRequest.packet.origin_address.includes(admin.city)) {
      throw new ForbiddenException('You can only assign agents to packets from your city');
    }
  
    // Verify agent is from the same city
    if (agent.city !== admin.city) {
      throw new ForbiddenException('You can only assign agents from your city');
    }
  
    pickupRequest.assigned_agent = agent;
    pickupRequest.status = 'assigned';
    return this.pickupRepository.save(pickupRequest);
  }

  // Agent views assigned pickups
  async getAgentPickups(agentId: number): Promise<PickupRequest[]> {
    return this.pickupRepository.find({
      where: { assigned_agent: { user_id: agentId } },
    });
  }

  //  Method for agent to mark pickup as delivered
  // async markAsDelivered(
  //   pickupId: number,
  //   agentId: number,
  // ): Promise<PickupRequest> {
  //   const pickup = await this.pickupRepository.findOne({
  //     where: { id: pickupId },
  //     relations: ['assigned_agent'],
  //   });

  //   if (!pickup) {
  //     throw new NotFoundException('Pickup request not found');
  //   }

  //   if (!pickup.assigned_agent || pickup.assigned_agent.user_id !== agentId) {
  //     throw new ForbiddenException('You are not assigned to this pickup');
  //   }

  //   pickup.status = 'at_origin_hub';
  //   return this.pickupRepository.save(pickup);
  // }

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
      throw new NotFoundException(`Pickup request with ID ${requestId} not found`);
    }
  
    if (!pickupRequest.assigned_agent) {
      throw new ForbiddenException('No agent is currently assigned to this pickup');
    }
  
    pickupRequest.assigned_agent = null;
    pickupRequest.status = 'pending';
  
    return this.pickupRepository.save(pickupRequest);
  }
}