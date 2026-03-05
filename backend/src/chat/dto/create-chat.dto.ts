import { IsString, IsArray, IsOptional, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({ description: 'Type of chat: private or group' })
  @IsString()
  @IsIn(['private', 'group'])
  type: string;

  @ApiPropertyOptional({ description: 'Name of the chat (optional for private)' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Array of user IDs to add to the chat' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  userIds?: string[];
}

export class UpdateChatDto {
  @ApiPropertyOptional({ description: 'Type of chat' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Name of the chat' })
  @IsOptional()
  @IsString()
  name?: string;
}
