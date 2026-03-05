import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'Chat id' })
  @IsString()
  chatId: string;

  @ApiProperty({ description: 'Sender user id' })
  @IsString()
  senderId: string;

  @ApiProperty({ description: 'Message content' })
  @IsString()
  content: string;
}

export class UpdateMessageDto {
  @ApiPropertyOptional({ description: 'Message content' })
  @IsOptional()
  @IsString()
  content?: string;
}
