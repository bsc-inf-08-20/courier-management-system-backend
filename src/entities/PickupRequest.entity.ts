import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity';
import { Packet } from './Packet.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class PickupRequest {
  @ApiProperty({ description: 'Pickup request ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Customer' })
  @ManyToOne(() => User, (user) => user.pickups, { onDelete: 'CASCADE' })
  customer: User; // The customer who booked the pickup

  @ApiProperty({ description: 'Pickup address' })
  @Column()
  pickup_address: string;

  @ApiProperty({ description: 'Pickup city' })
  @Column()
  pickup_city: string; // City where the pickup is requested

  @ApiProperty({ description: 'Destination address' })
  @Column()
  destination_address: string; 

  @ApiProperty({ description: 'Request status' })
  @Column({ default: 'pending' }) // 'pending', 'assigned', 'completed'
  status: string;

  @ApiProperty({ description: 'Assigned agent' })
  @ManyToOne(() => User, (user) => user.assignedPickups, { onDelete: 'SET NULL', nullable: true })
  assigned_agent: User | null; 

  @ApiProperty({ description: 'Packet' })
  @OneToOne(() => Packet, { cascade: true, eager: true }) 
  @JoinColumn() // ✅ Ensures a single packet per pickup request
  packet: Packet;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;
}
