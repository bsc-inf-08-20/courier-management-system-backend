import { Module } from '@nestjs/common';
import { PacketsService } from './packets.service';
import { PacketsController } from './packets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Packet } from 'src/entities/Packet.entity';
import { User } from 'src/entities/User.entity';
import { PickupRequest } from 'src/entities/PickupRequest.entity';
import { Vehicle } from 'src/entities/Vehicle.entity';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PickupRequest, User, Packet, Vehicle]),
    EmailModule,
  ],
  providers: [PacketsService],
  controllers: [PacketsController],
  exports: [PacketsService],
})
export class PacketsModule {}
