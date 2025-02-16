import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity() // Marks this class as a database table
export class Customer {
  @PrimaryGeneratedColumn() // Auto-incremented primary key
  customer_id: number;

  @Column({ length: 100 }) // A string column with a max length of 100
  name: string;

  @Column({ unique: true }) // A unique email column
  email: string;

  @Column({ unique: true })
  password: string;

  @Column({ length: 10 }) // A string column for phone numbers
  phone_number: string;

  @Column('text') // A column for long text (e.g., address)
  address: string;

  @CreateDateColumn() // Automatically stores when the record is created
  created_at: Date;
}
