import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChatMemberDto {
  @ApiProperty({ description: 'UUID of the chat member record' })
  @IsString()
  memberId: string;

  @ApiProperty({ description: 'UUID of the chat' })
  @IsString()
  chatId: string;

  @ApiProperty({ description: 'UUID of the user' })
  @IsString()
  userId: string;
}

export class UpdateChatMemberDto {
  @ApiPropertyOptional({ description: 'UUID of the chat member record' })
  @IsOptional()
  @IsString()
  memberId?: string;

  @ApiPropertyOptional({ description: 'UUID of the chat' })
  @IsOptional()
  @IsString()
  chatId?: string;

  @ApiPropertyOptional({ description: 'UUID of the user' })
  @IsOptional()
  @IsString()
  userId?: string;
}
