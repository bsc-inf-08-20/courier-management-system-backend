import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class RefreshToken {
  @ApiProperty({ description: 'Token ID' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'Refresh token' })
  @Column()
  token: string;

  @ApiProperty({ description: 'Expiry date' })
  @Column()
  expiryDate: Date;

  @ApiProperty({ description: 'User' })
  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User;

  @ApiProperty({ description: 'User ID' })
  @Column()
  user_id: number;

  @ApiProperty({ description: 'Is token revoked?' })
  @Column({ default: false })
  isRevoked: boolean;
}