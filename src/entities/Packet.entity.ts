import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { PickupRequest } from './PickupRequest.entity';

@Entity()
export class Packet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: [
      'pending',
      'collected',       // Agent collected
      'at_origin_hub',   // At origin hub (changed from 'at_hub')
      'in_transit',      // Dispatched for transport
      'at_destination_hub', // At destination hub
      'out_for_delivery', // With delivery agent
      'delivered',       // Delivered to recipient
      'received'         // Recipient confirmed
    ],
    default: 'pending',
  })
  status: string;

  @Column({ nullable: true })
  collected_at: Date;

  @Column({ nullable: true })
  origin_hub_confirmed_at: Date;

  @Column({ nullable: true })
  dispatched_at: Date;

  @Column({ nullable: true })
  destination_hub_confirmed_at: Date;

  @Column({ nullable: true })
  out_for_delivery_at: Date;

  @Column({ nullable: true })
  delivered_at: Date;

  @Column({ nullable: true })
  received_at: Date;

  @Column({ nullable: true })
  hub_confirmed_at: Date

  @Column('float')
  weight: number;

  @Column()
  category: string; //"electronics", "documents", "clothing", etc.

  @Column()
  origin_address: string;

  @Column()
  destination_address: string;

  @OneToOne(() => PickupRequest, (pickup) => pickup.packet, {
    onDelete: 'CASCADE',
  })
  pickup: PickupRequest;

  @Column({ default: false }) // ✅ Only allow Mzuzu to see confirmed packets
  confirmed_by_origin: boolean;
}
