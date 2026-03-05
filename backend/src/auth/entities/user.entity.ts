import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique user identifier' })
  id: string;

  @Column({ unique: true })
  @ApiProperty({ description: 'User email address' })
  email: string;

  /**
   * passwordHash is intentionally excluded from @ApiProperty to avoid
   * leaking it in Swagger responses.
   */
  @Column()
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
