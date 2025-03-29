import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AgentConfirmPickup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  goodsId: string;

  @Column()
  customerName: string;

  @Column('decimal')
  weight: number;

  @CreateDateColumn()
  dateOfPickup: Date;  // Auto-generated when record is created

  @CreateDateColumn()
  timeOfPickup: Date;  // Auto-generated timestamp

  @Column({ default: 'pending' })
  status: string;  // Default status is 'pending'
}
