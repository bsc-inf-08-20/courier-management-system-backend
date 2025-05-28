import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class AgentConfirmPickup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 255 })
  goodsId: string;

  @Column('varchar', { length: 255 })
  customerName: string;

  @Column('varchar', { length: 255 })
  location: string;

  @Column('decimal', { precision: 10, scale: 1, name: 'weight(kgs)' })
  weight: number;

  @CreateDateColumn()
  dateOfPickup: Date;  // Auto-generated when record is created

  @CreateDateColumn()
  timeOfPickup: Date;  // Auto-generated timestamp

  @Column({ default: 'pending' })
  status: string;  // Default status is 'pending'
  weightInKgs: number;
}
