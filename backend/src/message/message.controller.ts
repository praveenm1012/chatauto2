import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
  Injectable,
  CanActivate,
  ExecutionContext,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { MessageService, PaginatedMessages } from './message.service';

/**
 * Minimal JWT-auth guard stub.
 * TODO: Replace with a shared JwtAuthGuard from AuthModule in production.
 * This guard trusts that an upstream API gateway has validated the JWT
 * and attached the `user` object to the request.
 */
@Injectable()
class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: unknown }>();
    return !!request.user;
  }
}

@ApiTags('messages')
@ApiBearerAuth()
@Controller('chats')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get(':id/messages')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Fetch cursor-paginated message history for a chat' })
  @ApiQuery({ name: 'cursor', required: false, description: 'ISO date cursor for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Page size (default 20)' })
  @ApiResponse({ status: 200, description: 'Paginated list of messages' })
  @ApiResponse({ status: 403, description: 'Forbidden – not a chat member' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getMessages(
    @Param('id') chatId: string,
    @Req() req: { user: { id: string } },
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ): Promise<PaginatedMessages> {
    const pageSize = limit ? parseInt(limit, 10) : 20;
    return this.messageService.getMessages(chatId, req.user.id, pageSize, cursor);
  }
}
