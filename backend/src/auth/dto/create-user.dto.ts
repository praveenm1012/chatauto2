import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (min 6 characters)' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'User email address' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'User password (min 6 characters)' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}
