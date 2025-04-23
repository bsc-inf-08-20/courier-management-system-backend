// TrackingEvent.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { Packet } from './Packet.entity';
  
  @Entity()
  export class TrackingEvent {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Packet, { onDelete: 'CASCADE' })
    packet: Packet;
  
    @Column()
    status: string;
  
    @Column()
    location: string;
  
    @Column({ nullable: true })
    remarks: string;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  