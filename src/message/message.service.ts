import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { UpdateMessageDto } from '../dto/update-message.dto';
import { User } from '../entities/User.entity';  // Import the User entity

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    @InjectRepository(User)
    private userRepository: Repository<User>,  // Inject User repository
  ) {}

  async sendMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepository.create(createMessageDto);
    return this.messageRepository.save(message);
  }

  // Fix the find query by referencing the User entity properly
  async getMessagesForAgent(agentId: number): Promise<Message[]> {
    const agent = await this.userRepository.findOne({
       where: { user_id: Number(agentId) 

       }});  // Find the agent (user)
    if (!agent) {
      throw new NotFoundException(`Agent with ID ${agentId} not found`);
    }

    return this.messageRepository.find({
      where: { agent },  // Pass the agent object directly
      order: { createdAt: 'DESC' },
    });
  }

  async updateMessage(id: number, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const message = await this.messageRepository.findOne({ where: { id } });

    if (!message) {
      throw new NotFoundException(`Message with ID ${id} not found`);
    }

    Object.assign(message, updateMessageDto);
    return this.messageRepository.save(message);
  }
}
