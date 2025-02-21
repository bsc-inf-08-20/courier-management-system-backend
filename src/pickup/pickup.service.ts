import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PickupRequest } from '../entities/PickupRequest.entity';
import { PickupRequestDto } from '../dto/pickup-request.dto';
import { User } from '../entities/User.entity';
import { Role } from 'src/enum/role.enum';

@Injectable()
export class PickupService {
  constructor(
    @InjectRepository(PickupRequest)
    private pickupRepository: Repository<PickupRequest>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Customer requests a pickup
  async requestPickup(customerId: number, pickupData: PickupRequestDto): Promise<PickupRequest> {
    const customer = await this.userRepository.findOne({ where: { user_id: customerId } });

    if (!customer) throw new Error('Customer not found');

    const pickupRequest = this.pickupRepository.create({
      customer,
      pickup_address: pickupData.pickup_address,
    });

    return this.pickupRepository.save(pickupRequest);
  }

  // Admin assigns an agent based on location
  async assignAgent(pickupId: number, location: string): Promise<PickupRequest> {
    const pickup = await this.pickupRepository.findOne({ where: { id: pickupId } });

    if (!pickup) throw new NotFoundException('Pickup request not found');

    const agent = await this.userRepository.findOne({ where: { role: Role.AGENT, address: location } });

    if (!agent) throw new NotFoundException('No available agent for this location');

    pickup.assigned_agent = agent;
    pickup.status = 'assigned';

    return this.pickupRepository.save(pickup);
  }

  // Agent views assigned pickups
  async getAgentPickups(agentId: number): Promise<PickupRequest[]> {
    return this.pickupRepository.find({ where: { assigned_agent: { user_id: agentId } } });
  }
}

