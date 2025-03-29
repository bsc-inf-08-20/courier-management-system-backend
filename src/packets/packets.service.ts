import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Not, Repository } from 'typeorm';
import { Packet } from 'src/entities/Packet.entity';
import { User } from 'src/entities/User.entity';

@Injectable()
export class PacketsService {
  constructor(
    @InjectRepository(Packet)
    private readonly packetRepository: Repository<Packet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Fetch all packets from DB
  async getAllPackets(): Promise<Packet[]> {
    return this.packetRepository.find(); 
  }

  //comfirm dispatch
  async confirmPacketDispatch(packetId: number) {
    const packet = await this.packetRepository.findOne({ where: { id: packetId } });
  
    if (!packet) throw new NotFoundException('Packet not found');
  
    // ✅ Only confirm if the packet is still pending
    if (packet.status !== 'pending') throw new ConflictException('Packet already confirmed or delivered');
  
    packet.confirmed_by_origin = true;
    return this.packetRepository.save(packet);
  }


  // getPacketsForAdmin
  // async getPacketsForAdmin(adminCity: string): Promise<Packet[]> {
  //   return this.packetRepository.find({
  //     where: [
  //       { origin_address: Like(`%${adminCity}%`) }, // ✅ Admin sees packets from their city
  //       { 
  //         destination_address: Like(`%${adminCity}%`),  
  //         confirmed_by_origin: true  // ✅ Only show incoming packets if confirmed
  //       }
  //     ],
  //   });
  // }

  async getPacketsForAdmin(adminId: number): Promise<Packet[]> {
    const admin = await this.userRepository.findOne({ 
      where: { user_id: adminId },
      select: ['city']
    });

    if (!admin) throw new NotFoundException('Admin not found');

    return this.packetRepository.find({
      where: [
        { 
          origin_address: Like(`%${admin.city}%`),
          status: Not('received') // Show all packets from their city
        },
        { 
          destination_address: Like(`%${admin.city}%`),
          status: 'at_destination_hub' // Only show incoming packets when they reach the hub
        }
      ],
      relations: ['pickup', 'pickup.customer', 'pickup.assigned_agent']
    });
  }

  async agentConfirmCollection(packetId: number, agentId: number): Promise<Packet> {
    const packet = await this.packetRepository.findOne({
      where: { id: packetId },
      relations: ['pickup', 'pickup.assigned_agent'],
    });

    if (!packet) throw new NotFoundException('Packet not found');
    if (!packet.pickup) throw new NotFoundException('Pickup request not found');
    if (packet.pickup.assigned_agent?.user_id !== agentId) {
      throw new ForbiddenException('You are not assigned to this pickup');
    }

    packet.status = 'collected';
    packet.collected_at = new Date();
    return this.packetRepository.save(packet);
  }



  
  async adminConfirmAtHub(packetId: number): Promise<Packet> {
    const packet = await this.packetRepository.findOne({
      where: { id: packetId },
      relations: ['pickup'] // Include relations if needed
    });
  
    if (!packet) {
      throw new NotFoundException('Packet not found');
    }
  
    // Enhanced validation
    if (packet.status !== 'collected') {
      throw new ConflictException(
        `Packet must be in 'collected' status. Current status: ${packet.status}`
      );
    }
  
    // Use the exact enum value
    packet.status = 'at_origin_hub'; // Changed from 'at_hub'
    packet.origin_hub_confirmed_at = new Date();
    
    try {
      const savedPacket = await this.packetRepository.save(packet);
      console.log('Saved packet:', savedPacket); // Debug log
      return savedPacket;
    } catch (error) {
      console.error('Error saving packet:', error);
      throw new InternalServerErrorException('Failed to update packet status');
    }
  }


  
  async adminDispatchForTransport(packetId: number): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id: packetId });
    if (!packet) throw new NotFoundException('Packet not found');
    if (packet.status !== 'at_origin_hub') {
      throw new ConflictException('Packet must be at hub first');
    }

    packet.status = 'in_transit';
    packet.dispatched_at = new Date();
    return this.packetRepository.save(packet);
  }

  async confirmAtDestinationHub(packetId: number): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id: packetId });
    if (!packet) throw new NotFoundException('Packet not found');
    if (packet.status !== 'in_transit') {
      throw new ConflictException('Packet must be in transit first');
    }

    packet.status = 'at_destination_hub';
    packet.destination_hub_confirmed_at = new Date();
    return this.packetRepository.save(packet);
  }


  async markOutForDelivery(packetId: number): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id: packetId });
    if (!packet) throw new NotFoundException('Packet not found');
    if (packet.status !== 'at_destination_hub') {
      throw new ConflictException('Packet must be at destination hub first');
    }

    packet.status = 'out_for_delivery';
    packet.out_for_delivery_at = new Date();
    return this.packetRepository.save(packet);
  }



  async markAsDelivered(packetId: number): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id: packetId });
    if (!packet) throw new NotFoundException('Packet not found');
    if (packet.status !== 'out_for_delivery') {
      throw new ConflictException('Packet must be out for delivery first');
    }

    packet.status = 'delivered';
    packet.delivered_at = new Date();
    return this.packetRepository.save(packet);
  }



  async confirmReceiverReceived(packetId: number): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id: packetId });
    if (!packet) throw new NotFoundException('Packet not found');
    if (packet.status !== 'delivered') {
      throw new ConflictException('Packet must be delivered first');
    }

    packet.status = 'received';
    packet.received_at = new Date();
    return this.packetRepository.save(packet);
  }

 
  
}

