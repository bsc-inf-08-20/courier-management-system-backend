import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupRequest } from '../entities/PickupRequest.entity';
import { PickupService } from './pickup.service';
import { PickupController } from './pickup.controller';
import { User } from '../entities/User.entity';
import { Packet } from 'src/entities/Packet.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([PickupRequest, User, Packet]), UsersModule], // ✅ Register the entity
  controllers: [PickupController],
  providers: [PickupService],
  exports: [PickupService], // ✅ Export if needed in other modules
})
export class PickupModule {}
