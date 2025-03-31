import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity';

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

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn()
  assigned_driver?: User; // Nullable, links to driver
}