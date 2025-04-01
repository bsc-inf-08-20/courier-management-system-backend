import { WebSocketGateway, SubscribeMessage, WebSocketServer, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { MessagesService } from '../message/message.service';
import { UpdateMessageDto } from '../dto/update-message.dto';

@WebSocketGateway({ cors: true })
export class MessagesGateway {
  @WebSocketServer() server: Server;

  constructor(private messagesService: MessagesService) {}

  @SubscribeMessage('sendMessage')
  async handleMessage(@MessageBody() data: { adminId: number; agentId: number; content: string }) {
    const message = await this.messagesService.sendMessage(data);
    this.server.emit(`messageToAgent-${data.agentId}`, message);
    return message;
  }

  @SubscribeMessage('updateMessage')
  async handleUpdateMessage(@MessageBody() data: { id: number; update: UpdateMessageDto }) {
    const updatedMessage = await this.messagesService.updateMessage(data.id, data.update);
    this.server.emit(`messageUpdated-${data.id}`, updatedMessage);
    return updatedMessage;
  }
}
