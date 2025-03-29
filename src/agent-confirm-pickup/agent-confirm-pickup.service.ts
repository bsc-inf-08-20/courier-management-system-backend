import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AgentConfirmPickup } from '../entities/agent-confirm-pickup.entity';
import { CreateAgentConfirmPickupDto } from '../dto/create-agent-confirm-pickup.dto';

@Injectable()
export class AgentConfirmPickupService {
  constructor(
    @InjectRepository(AgentConfirmPickup)
    private readonly pickupRepository: Repository<AgentConfirmPickup>,
  ) {}

  async confirmPickup(data: CreateAgentConfirmPickupDto): Promise<AgentConfirmPickup> {
    const pickup = this.pickupRepository.create(data);
    return await this.pickupRepository.save(pickup);
  }

  async getAllPickups(): Promise<AgentConfirmPickup[]> {
    return await this.pickupRepository.find();
  }
}
