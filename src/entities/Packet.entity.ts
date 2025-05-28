import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { PickupRequest } from './PickupRequest.entity';
import { User } from './User.entity';
import { Vehicle } from './Vehicle.entity';
import { v4 as uuidv4 } from 'uuid'; // ✅ Import UUID

@Entity()
export class Packet {
  @PrimaryGeneratedColumn()
  id: number;

   @Column({ unique: true })
  trackingId: string; // 🆕 Added for tracking
  

  
  @BeforeInsert() // ✅ Lifecycle hook to auto-generate tracking ID
  generateTrackingId() {
    this.trackingId = `TRK-${uuidv4().slice(0, 8).toUpperCase()}`;
  }

  @Column()
  description: string;

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

  @Column('float')
  weight: number;

  @Column()
  category: string; //"electronics", "documents", "clothing", etc.

  @Column()
  instructions: string;

  @Column('simple-json', { nullable: true })
  sender: {
    name: string;
    email: string;
    phone_number: string;
  }; // Sender details

  @Column('simple-json', { nullable: true })
  receiver: {
    name: string;
    email: string;
    phone_number: string;
  };

  @Column({ type: 'timestamp', nullable: true })
pickup_window_start: Date;

@Column({ type: 'timestamp', nullable: true })
pickup_window_end: Date;@Column({ type: 'timestamp', nullable: true })


  @Column({ type: 'varchar', length: 50, nullable: false })
  delivery_type: 'pickup' | 'delivery';

  @Column()
  origin_address: string;

  @Column('simple-json', { nullable: true })
  origin_coordinates: { lat: number; lng: number };

  @Column()
  destination_address: string;

  @Column('simple-json', { nullable: true })
  destination_coordinates: { lat: number; lng: number };

  @Column({ type: 'varchar', length: 50, nullable: true })
  destination_hub: string; // Destination hub name (for pickup)

  @OneToOne(() => PickupRequest, (pickup) => pickup.packet, {
    onDelete: 'CASCADE',
  })
  pickup: PickupRequest;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  assigned_pickup_agent: User;

  // Add to your Packet entity
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  assigned_driver: User;

  @ManyToOne(() => Vehicle, (vehicle) => vehicle.assigned_packets, {
    nullable: true,
  })
  assigned_vehicle?: Vehicle | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  assigned_delivery_agent: User | null;

  @Column({ default: false }) // Only allow Mzuzu to see confirmed packets
  confirmed_by_origin: boolean;

  @CreateDateColumn()
  created_at: Date;

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
  hub_confirmed_at: Date;

  @Column({ default: false })
  is_paid: boolean;

  @Column({ type: 'text', nullable: true })
signature_base64: string;

  
}
