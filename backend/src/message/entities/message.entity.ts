import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ type: 'varchar' })
  @ApiProperty({ description: 'Chat this message belongs to' })
  chatId: string;

  @Column({ type: 'varchar' })
  @ApiProperty({ description: 'Sender user id' })
  senderId: string;

  @Column({ type: 'text' })
  @ApiProperty({ description: 'Message content' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
