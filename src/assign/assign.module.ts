// src/assign/assign.module.ts
import { Module } from '@nestjs/common';
import { AssignController } from './assign.controller';
import { PacketsModule } from '../packets/packets.module';
import { MailService } from 'src/mails/mails.service';

@Module({
  imports: [PacketsModule],
  providers: [MailService, PacketsModule],
  controllers: [AssignController],
})
export class AssignModule {}



