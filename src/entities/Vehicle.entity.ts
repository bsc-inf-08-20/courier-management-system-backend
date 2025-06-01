import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { User } from './User.entity';
import { Packet } from './Packet.entity';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Vehicle {
  @ApiProperty({ description: 'Vehicle ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Vehicle make' })
  @Column()
  make: string;

  @ApiProperty({ description: 'Vehicle model' })
  @Column()
  model: string;

  @ApiProperty({ description: 'Vehicle year' })
  @Column()
  year: number;

  @ApiProperty({ description: 'License plate', uniqueItems: true })
  @Column({ unique: true })
  license_plate: string;

  @ApiProperty({ description: 'Vehicle type' })
  @Column()
  vehicle_type: string; // e.g., "Van", "Truck"

  @ApiProperty({ description: 'Vehicle capacity (kg)' })
  @Column('float')
  capacity: number; // in kg

  @ApiProperty({ description: 'Is vehicle active?' })
  @Column({ default: true })
  is_active: boolean;

  @ApiProperty({ description: 'Is vehicle in maintenance?' })
  @Column({ default: false })
  is_in_maintenance: boolean;

  @ApiProperty({ description: 'Current city' })
  @Column()
  current_city: string;

  @ApiProperty({ description: 'Destination city' })
  @Column('varchar', { nullable: true }) // Explicitly specify the type as 'varchar'
  destination_city?: string | null; // New field to track where the vehicle is going

  @ApiProperty({ description: 'Current load (kg)' })
  @Column('float', { default: 0 })
  current_load: number;

  @ApiProperty({ description: 'Vehicle status' })
  @Column({ default: 'available' }) // Add status field
  status: string; // e.g., "available", "in_transit"

  @ApiProperty({ description: 'Assigned driver' })
  @OneToOne(() => User, (user) => user.assignedVehicle, { nullable: true })
  @JoinColumn() // This MUST be on the owning side (Vehicle)
  @Type(() => User)
  assigned_driver?: User | null;

  @ApiProperty({ description: 'Assigned packets' })
  @OneToMany(() => Packet, (packet) => packet.assigned_vehicle)
  assigned_packets: Packet[];
}
