import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { MessagesService } from '../message/message.service';
import { CreateMessageDto } from '../dto/create-message.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.messagesService.sendMessage(createMessageDto);
  }

  @Get('agent/:agentId')
  async getAgentMessages(@Param('agentId') agentId: number) {
    return this.messagesService.getMessagesForAgent(agentId);
  }
}
