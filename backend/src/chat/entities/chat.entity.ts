import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({ unique: true })
  @ApiProperty({ description: 'UUID of the chat' })
  chatId: string;

  @Column()
  @ApiProperty({ description: 'Type of chat: private or group' })
  type: string;

  @Column({ nullable: true, type: 'varchar' })
  @ApiProperty({ description: 'Name of the chat' })
  name: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
