import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesService } from '../message/message.service';
import { MessagesController } from '../message/message.controller';
import { MessagesGateway } from '../message_gateway/message_gateway.gateway';
import { Message } from '../entities/message.entity';
import { User } from '../entities/User.entity'; // ✅ Import User entity
import { UsersModule } from '../users/users.module'; // ✅ Import UsersModule

@Module({
  imports: [
    TypeOrmModule.forFeature([Message, User]), // ✅ Ensure User entity is included
    UsersModule, // ✅ Ensure UserService and repository are available
  ],
  providers: [MessagesService, MessagesGateway],
  controllers: [MessagesController],
  exports: [MessagesService], // ✅ Export MessagesService if needed in other modules
})
export class MessagesModule {}
