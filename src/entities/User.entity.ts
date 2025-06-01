import { Role } from 'src/enum/role.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PickupRequest } from './PickupRequest.entity';
import { Profile } from './Profile.entity';
import { Vehicle } from './Vehicle.entity';
import { RefreshToken } from './RefreshToken.entity';
import { Exclude, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Entity() // Marks this class as a database table
export class User {
  @ApiProperty({ description: 'User ID' })
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  user_id: number;

  @ApiProperty({ description: 'User name' })
  @Column({ length: 100 }) // A string column with a max length of 100
  name: string;

  @ApiProperty({ description: 'User email', uniqueItems: true })
  @Column({ unique: true }) // A unique email column
  email: string;

  @ApiProperty({ description: 'User password' })
  @Column({ unique: false })
  password: string;

  @ApiProperty({ description: 'Phone number' })
  @Column({ length: 10 }) // A string column for phone numbers
  phone_number: string;

  // @Column('text') // A column for long text (e.g., address)
  // address: string;

  @ApiProperty({ description: 'City' })
  @Column({ length: 50 }) // New column to store the city
  city: string;

  @ApiProperty({ description: 'Area' })
  @Column({ length: 50 }) // New column to store the city
  area: string;

  @ApiProperty({ description: 'User role', enum: Role, default: Role.USER })
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @ApiProperty({ description: 'Pickup requests' })
  @OneToMany(() => PickupRequest, (pickup) => pickup.customer)
  pickups: PickupRequest[];

  @ApiProperty({ description: 'Assigned pickup requests' })
  @OneToMany(() => PickupRequest, (pickup) => pickup.assigned_agent, {
    cascade: true,
  })
  assignedPickups: PickupRequest[]; // If an agent is deleted, set pickups to NULL

  @ApiProperty({ description: 'User profile' })
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;

  @ApiProperty({ description: 'Refresh tokens' })
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @ApiProperty({ description: 'Assigned vehicle' })
  @OneToOne(() => Vehicle, (vehicle) => vehicle.assigned_driver, {
    nullable: true,
  })
  @Type(() => Vehicle)
  assignedVehicle: Vehicle | null; // Inverse side

  @ApiProperty({ description: 'Current city' })
  @Column()
  current_city: string;

  @ApiProperty({ description: 'Is user active?' })
  @Column({ default: false })
  is_active: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn() // Automatically stores when the record is created
  created_at: Date;
}
