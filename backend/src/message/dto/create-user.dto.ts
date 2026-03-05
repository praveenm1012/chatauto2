import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Hashed password' })
  @IsString()
  passwordHash: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Hashed password' })
  @IsOptional()
  @IsString()
  passwordHash?: string;
}
