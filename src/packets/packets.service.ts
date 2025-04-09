import { BadRequestException, ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Not, Repository } from 'typeorm';
import { Packet } from 'src/entities/Packet.entity';
import { User } from 'src/entities/User.entity';
import { Vehicle } from 'src/entities/Vehicle.entity';
import { Role } from 'src/enum/role.enum';
import { sendMail } from 'src/utils/mail';

@Injectable()
export class PacketsService {
  constructor(
    @InjectRepository(Packet)
    private readonly packetRepository: Repository<Packet>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Vehicle)
        private readonly vehicleRepository: Repository<Vehicle>,
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

  // get packets based on the city of the admin (origin and destination<after confirmed>)
  async getPacketsForAdmin(adminId: number): Promise<Packet[]> {
    const admin = await this.userRepository.findOne({ 
      where: { user_id: adminId },
      select: ['city', 'email'] //Select the city and email of the admin
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


  //comfim the collection 
  // async agentConfirmCollection(packetId: number, agentId: number, weight?: number): Promise<Packet> {
  //   const packet = await this.packetRepository.findOne({
  //     where: { id: packetId },
  //     relations: ['pickup', 'pickup.assigned_agent'],
  //   });

  //   if (!packet) throw new NotFoundException('Packet not found');
  //   if (!packet.pickup) throw new NotFoundException('Pickup request not found');
  //   if (packet.pickup.assigned_agent?.user_id !== agentId) {
  //     throw new ForbiddenException('You are not assigned to this pickup');
  //   }

  //   if (packet.status !== 'pending') {
  //     throw new ForbiddenException('Packet is not in a state to be collected');
  //   }

  //   // Update weight if provided and valid
  //   if (weight !== undefined) {
  //     if (weight <= 0) {
  //       throw new ForbiddenException('Weight must be greater than 0');
  //     }
  //     packet.weight = weight;
  //   }

  //   packet.status = 'collected';
  //   packet.collected_at = new Date();
  //   return this.packetRepository.save(packet);
  // }

  async updateWeight(id: number, weight: number): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id });
    if (!packet) {
      throw new Error('Packet not found');
    }

    packet.weight = weight;
    return this.packetRepository.save(packet);
  }

  async agentConfirmCollection(id: number, weight?: number): Promise<Packet> {
    const packet = await this.packetRepository.findOneBy({ id });
    if (!packet) {
      throw new Error('Packet not found');
    }

    if (weight) {
      packet.weight = weight;
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

  async dispatchBatch(packetIds: number[], driverId: number, vehicleId: number): Promise<Packet[]> {
    // Use the In operator to find packets by their IDs
    const packets = await this.packetRepository.find({ where: { id: In(packetIds) } });
    if (packets.length !== packetIds.length) {
      throw new NotFoundException('One or more packets not found');
    }

    const driver = await this.userRepository.findOne({ where: { user_id: driverId, role: Role.DRIVER } });
    if (!driver) throw new NotFoundException('Driver not found');

    const vehicle = await this.vehicleRepository.findOne({ where: { id: vehicleId } });
    if (!vehicle || !vehicle.is_active || vehicle.is_in_maintenance) {
      throw new NotFoundException('Vehicle not found or unavailable');
    }

    const totalWeight = packets.reduce((sum, p) => sum + p.weight, 0);
    if (totalWeight > vehicle.capacity) {
      throw new BadRequestException(
        `Total weight (${totalWeight}kg) exceeds vehicle capacity (${vehicle.capacity}kg)`
      );
    }

    for (const packet of packets) {
      if (packet.status !== 'at_origin_hub') {
        throw new BadRequestException(`Packet ${packet.id} is not ready for dispatch`);
      }
      packet.status = 'in_transit';
      packet.assigned_driver = driver;
      packet.assigned_vehicle = vehicle;
      packet.dispatched_at = new Date();

      // Sending an email to the assigned agent about the packet dispatch
      if (packet.pickup?.assigned_agent) {
        const agent = packet.pickup.assigned_agent;
        const admin = await this.userRepository.findOne({ where: { user_id: driverId } }); // Get admin's details

        if (admin && agent.email) {
          await sendMail({
            to: agent.email,
            name: agent.name,
            subject: 'Packet Assigned',
            body: `
              <p>Hello ${agent.name},</p>
              <p>You have been assigned a packet for pickup. Details:</p>
              <p>Packet ID: ${packet.id}</p>
              <p>Assigned by: ${admin.name}</p>
            `
          });
        }
      }
    }

    vehicle.assigned_driver = driver;
    await this.vehicleRepository.save(vehicle);
    return this.packetRepository.save(packets);
  }
 
  
}

