import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PickupModule } from './pickup/pickup.module';
import { PickupRequest } from './entities/PickupRequest.entity';
import { Packet } from './entities/Packet.entity';
import {AgentConfirmPickup} from './entities/agent-confirm-pickup.entity';
import { AgentModule } from './agent/agent.module';
import { AgentConfirmPickupModule } from './agent-confirm-pickup/agent-confirm-pickup.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'courier_db',
      // entities: [__dirname + '/entities/*.ts'], // Path to your entity files
      entities: [User, PickupRequest, Packet,AgentConfirmPickup],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    PickupModule,
    AgentModule,
    AgentConfirmPickupModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
