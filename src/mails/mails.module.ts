
// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { MailService } from './mails.service';

@Module({
  providers: [MailService],
  exports: [MailService], // Export so AssignModule can use it
})
export class MailModule {}
