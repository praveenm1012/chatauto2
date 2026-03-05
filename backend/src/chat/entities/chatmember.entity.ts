import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('chat_members')
export class ChatMember {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ unique: true })
  @ApiProperty({ description: 'UUID of the chat member record' })
  memberId: string;

  @Column()
  @ApiProperty({ description: 'UUID of the chat' })
  chatId: string;

  @Column()
  @ApiProperty({ description: 'UUID of the user' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
