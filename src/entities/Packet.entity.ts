import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  BeforeInsert,
} from 'typeorm';
import { PickupRequest } from './PickupRequest.entity';
import { User } from './User.entity';
import { Vehicle } from './Vehicle.entity';
import { v4 as uuidv4 } from 'uuid'; // 🆕 Import UUID for tracking ID generation
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Packet {
  @ApiProperty({ description: 'Packet ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Tracking ID', uniqueItems: true })
  @Column({ unique: true })
  trackingId: string; // 🆕 Added for tracking

  @BeforeInsert() // ✅ Lifecycle hook to auto-generate tracking ID
  generateTrackingId() {
    this.trackingId = `TRK-${uuidv4().slice(0, 8).toUpperCase()}`;
  }

  @ApiProperty({ description: 'Packet description' })
  @Column()
  description: string;

  @ApiProperty({
    description: 'Packet status',
    enum: [
      'pending',
      'collected',
      'at_origin_hub',
      'in_transit',
      'at_destination_hub',
      'out_for_delivery',
      'delivered',
      'received',
    ],
    default: 'pending',
  })
  @Column({
    type: 'enum',
    enum: [
      'pending',
      'collected', // Agent collected
      'at_origin_hub', // At origin hub (changed from 'at_hub')
      'in_transit', // Dispatched for transport
      'at_destination_hub', // At destination hub
      'out_for_delivery', // With delivery agent
      'delivered', // Delivered to recipient
      'received', // Recipient confirmed
    ],
    default: 'pending',
  })
  status: string;

  @ApiProperty({ description: 'Packet weight' })
  @Column('float')
  weight: number;

  @ApiProperty({ description: 'Packet category' })
  @Column()
  category: string; //"electronics", "documents", "clothing", etc.

  @ApiProperty({ description: 'Delivery instructions' })
  @Column()
  instructions: string;

  @ApiProperty({ description: 'Sender details' })
  @Column('simple-json', { nullable: true })
  sender: {
    name: string;
    email: string;
    phone_number: string;
  }; // Sender details

  @ApiProperty({ description: 'Receiver details' })
  @Column('simple-json', { nullable: true })
  receiver: {
    name: string;
    email: string;
    phone_number: string;
  };

  @ApiProperty({ description: 'Pickup window start time' })
  @Column({ type: 'timestamp', nullable: true })
  pickup_window_start: Date;

  @ApiProperty({ description: 'Pickup window end time' })
  @Column({ type: 'timestamp', nullable: true })
  pickup_window_end: Date;

  @ApiProperty({ description: 'Delivery type' })
  @Column({ type: 'varchar', length: 50, nullable: false })
  delivery_type: 'pickup' | 'delivery';

  @ApiProperty({ description: 'Origin city' })
  @Column()
  origin_city: string;

  @ApiProperty({ description: 'Origin address' })
  @Column()
  origin_address: string;

  @ApiProperty({ description: 'Origin coordinates' })
  @Column('simple-json', { nullable: true })
  origin_coordinates: { lat: number; lng: number };

  @ApiProperty({ description: 'Destination address' })
  @Column()
  destination_address: string;

  @ApiProperty({ description: 'Destination coordinates' })
  @Column('simple-json', { nullable: true })
  destination_coordinates: { lat: number; lng: number };

  @ApiProperty({ description: 'Destination hub' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  destination_hub: string; // Destination hub name (for pickup)

  @ApiProperty({ description: 'Pickup request' })
  @OneToOne(() => PickupRequest, (pickup) => pickup.packet, {
    onDelete: 'CASCADE',
  })
  pickup: PickupRequest;

  @ApiProperty({ description: 'Assigned pickup agent' })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  assigned_pickup_agent: User;

  @ApiProperty({ description: 'Assigned driver' })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  assigned_driver: User;

  @ApiProperty({ description: 'Assigned vehicle' })
  @ManyToOne(() => Vehicle, (vehicle) => vehicle.assigned_packets, {
    nullable: true,
  })
  assigned_vehicle?: Vehicle | null;

  @ApiProperty({ description: 'Assigned delivery agent' })
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  assigned_delivery_agent: User | null;

  @ApiProperty({ description: 'Confirmation by origin' })
  @Column({ default: false }) // Only allow Mzuzu to see confirmed packets
  confirmed_by_origin: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Collection timestamp' })
  @Column({ nullable: true })
  collected_at: Date;

  @ApiProperty({ description: 'Origin hub confirmation timestamp' })
  @Column({ nullable: true })
  origin_hub_confirmed_at: Date;

  @ApiProperty({ description: 'Dispatch timestamp' })
  @Column({ nullable: true })
  dispatched_at: Date;

  @ApiProperty({ description: 'Destination hub confirmation timestamp' })
  @Column({ nullable: true })
  destination_hub_confirmed_at: Date;

  @ApiProperty({ description: 'Out for delivery timestamp' })
  @Column({ nullable: true })
  out_for_delivery_at: Date;

  @ApiProperty({ description: 'Delivery timestamp' })
  @Column({ nullable: true })
  delivered_at: Date;

  @ApiProperty({ description: 'Hub confirmation timestamp' })
  @Column({ nullable: true })
  hub_confirmed_at: Date;

  @ApiProperty({ description: 'Payment status' })
  @Column({ default: false })
  is_paid: boolean;

  @ApiProperty({ description: 'Signature (base64)' })
  @Column({ type: 'text', nullable: true })
  signature_base64: string;

  @ApiProperty({ description: 'National ID' })
  @Column({ type: 'text', nullable: true })
  nationalId: string;
}
