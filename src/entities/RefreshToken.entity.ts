import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from './User.entity';

@Entity()
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  token: string;

  @Column()
  expiryDate: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  user: User;

  @Column({ default: false })
  isRevoked: boolean;
}