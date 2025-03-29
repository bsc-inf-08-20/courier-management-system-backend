import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgentConfirmPickup } from '../entities/agent-confirm-pickup.entity';
import { AgentConfirmPickupService } from './agent-confirm-pickup.service';
import { AgentConfirmPickupController } from './agent-confirm-pickup.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AgentConfirmPickup])],
  providers: [AgentConfirmPickupService],
  controllers: [AgentConfirmPickupController],
})
export class AgentConfirmPickupModule {}
