import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, OneToMany, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity';
import { Packet } from './Packet.entity';

@Entity()
export class PickupRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.pickups, { onDelete: 'CASCADE' })
  customer: User; // The customer who booked the pickup

  @Column()
  pickup_address: string;

  @Column()
  pickup_city: string; // City where the pickup is requested

  @Column()
  destination_address: string; 

  @Column({ default: 'pending' }) // 'pending', 'assigned', 'completed'
  status: string;

  @ManyToOne(() => User, (user) => user.assignedPickups, { onDelete: 'SET NULL', nullable: true })
  assigned_agent: User | null; 

  @OneToOne(() => Packet, { cascade: true, eager: true }) 
  @JoinColumn() // ✅ Ensures a single packet per pickup request
  packet: Packet;

  @CreateDateColumn()
  created_at: Date; 
}
