import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

// TODO: Replace with a real JwtAuthGuard imported from AuthModule.
// The current ChatController has no @UseGuards decorator, meaning all
// endpoints are publicly accessible. Add the guard once AuthModule is shared.

@ApiTags('chats')
@ApiBearerAuth()
@Controller('chats')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new chat' })
  @ApiResponse({ status: 201, description: 'Chat created successfully' })
  async createChat(
    @Body() createChatDto: CreateChatDto,
    @Request() req: { user?: { id?: string; userId?: string; sub?: string } },
  ) {
    const userId: string | undefined =
      req.user?.id ?? req.user?.userId ?? req.user?.sub;
    if (!userId) {
      throw new ForbiddenException('Authenticated user not found in request');
    }
    return this.chatService.createChat(createChatDto, userId);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'List all chats for the authenticated user' })
  @ApiResponse({ status: 200, description: 'List of chats' })
  async listChats(
    @Request() req: { user?: { id?: string; userId?: string; sub?: string } },
  ) {
    const userId: string | undefined =
      req.user?.id ?? req.user?.userId ?? req.user?.sub;
    if (!userId) {
      throw new ForbiddenException('Authenticated user not found in request');
    }
    return this.chatService.listChats(userId);
  }
}
