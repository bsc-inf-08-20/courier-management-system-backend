import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from './User.entity';

@Entity()
export class PickupRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.pickups, { onDelete: 'CASCADE' })
  customer: User; // The customer who booked the pickup

  @Column()
  pickup_address: string;


  @Column({ default: 'pending' }) // 'pending', 'assigned', 'completed'
  status: string;

  @ManyToOne(() => User, (user) => user.assignedPickups, { onDelete: 'SET NULL', nullable: true })
  assigned_agent: User | null; 


  @CreateDateColumn()
  created_at: Date;
}
