import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { PickupRequest } from './PickupRequest.entity';

@Entity()
export class Packet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ['pending', 'in_transit', 'delivered'], default: 'pending' })
  status: string;

  @Column('float')
  weight: number;

  @Column()
  category: string; //"electronics", "documents", "clothing", etc.

  @Column()
  origin_address: string; 

  @Column()
  destination_address: string;

  @OneToOne(() => PickupRequest, (pickup) => pickup.packet, { onDelete: 'CASCADE' })
  pickup: PickupRequest;
}
