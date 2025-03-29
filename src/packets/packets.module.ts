import { Module } from '@nestjs/common';
import { PacketsService } from './packets.service';
import { PacketsController } from './packets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Packet } from 'src/entities/Packet.entity';
import { User } from 'src/entities/User.entity';
import { PickupRequest } from 'src/entities/PickupRequest.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PickupRequest, User, Packet])],
  providers: [PacketsService],
  controllers: [PacketsController]
})
export class PacketsModule {}
