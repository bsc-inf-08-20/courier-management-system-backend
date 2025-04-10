import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { User } from './User.entity';
import { Packet } from './Packet.entity';

@Entity()
export class Vehicle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  make: string;

  @Column()
  model: string;

  @Column()
  year: number;

  @Column({ unique: true })
  license_plate: string;

  @Column()
  vehicle_type: string; // e.g., "Van", "Truck"

  @Column('float')
  capacity: number; // in kg

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_in_maintenance: boolean;

  @Column()
  current_city: string; 

  @Column('varchar', { nullable: true }) // Explicitly specify the type as 'varchar'
  destination_city?: string | null;// New field to track where the vehicle is going

  @Column('float', { default: 0 })
  current_load: number;

  @Column({ default: 'available' }) // Add status field
  status: string; // e.g., "available", "in_transit"

  @OneToOne(() => User, (user) => user.assignedVehicle, { nullable: true })
  @JoinColumn()
  assigned_driver?: User | null; // Nullable, links to driver

  @OneToMany(() => Packet, (packet) => packet.assigned_vehicle)
  assigned_packets: Packet[]; 
}