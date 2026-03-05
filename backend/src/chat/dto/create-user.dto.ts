import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'UUID of the user' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Email of the user' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Hashed password' })
  @IsString()
  passwordHash: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'UUID of the user' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'Email of the user' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Hashed password' })
  @IsOptional()
  @IsString()
  passwordHash?: string;
}
