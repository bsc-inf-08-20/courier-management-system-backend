import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Profile {
  @ApiProperty({ description: 'Profile ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'User' })
  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @ApiProperty({ description: 'User bio' })
  @Column({ type: 'text', nullable: true })
  bio: string;

  @ApiProperty({ description: 'Date of birth' })
  @Column({ nullable: true })
  date_of_birth: Date;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  created_at: Date;

  @ApiProperty({ description: 'Update timestamp' })
  @UpdateDateColumn()
  updated_at: Date;
}