import { Role } from 'src/enum/role.enum';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { PickupRequest } from './PickupRequest.entity';

@Entity() // Marks this class as a database table
export class User {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  user_id: number;

  @Column({ length: 100 }) // A string column with a max length of 100
  name: string;

  @Column({ unique: true }) // A unique email column
  email: string;

  @Column({ unique: false })
  password: string;

  @Column({ length: 10 }) // A string column for phone numbers
  phone_number: string;

  // @Column('text') // A column for long text (e.g., address)
  // address: string;

  @Column({ length: 50 }) // New column to store the city
  city: string;

  @Column({ length: 50 }) // New column to store the city
  area: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @OneToMany(() => PickupRequest, (pickup) => pickup.customer)
  pickups: PickupRequest[];

  @OneToMany(() => PickupRequest, (pickup) => pickup.assigned_agent, { cascade: true })
  assignedPickups: PickupRequest[]; // ✅ If an agent is deleted, set pickups to NULL

  @CreateDateColumn() // Automatically stores when the record is created
  created_at: Date;
}
