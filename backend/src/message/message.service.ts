import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, FindOptionsWhere } from 'typeorm';

import { Message } from './entities/message.entity';
import { User } from './entities/user.entity';

export interface PaginatedMessages {
  messages: {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
  }[];
  nextCursor: string | null;
}

@Injectable()
export class MessageService {
  private readonly logger = new Logger(MessageService.name);

  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getMessages(
    chatId: string,
    requesterId: string,
    limit = 20,
    cursor?: string,
  ): Promise<PaginatedMessages> {
    this.logger.log(
      `getMessages: chatId=${chatId}, requesterId=${requesterId}, limit=${limit}, cursor=${cursor ?? 'none'}`,
    );

    try {
      const user = await this.userRepository.findOne({ where: { id: requesterId } });
      if (!user) {
        this.logger.warn(`Requester not found: ${requesterId}`);
        throw new NotFoundException('Requesting user not found');
      }

      const memberCheck = await this.messageRepository.findOne({
        where: { chatId, senderId: requesterId },
      });
      if (!memberCheck) {
        this.logger.warn(
          `User ${requesterId} attempted to access chat ${chatId} without membership`,
        );
        throw new ForbiddenException('You are not a member of this chat');
      }

      const pageSize = limit + 1;

      const whereClause: FindOptionsWhere<Message> = { chatId };
      if (cursor) {
        whereClause.createdAt = LessThan(new Date(cursor));
      }

      const rows = await this.messageRepository.find({
        where: whereClause,
        order: { createdAt: 'DESC' },
        take: pageSize,
      });

      const hasMore = rows.length === pageSize;
      const items = hasMore ? rows.slice(0, limit) : rows;

      const nextCursor: string | null = hasMore
        ? items[items.length - 1].createdAt.toISOString()
        : null;

      this.logger.log(
        `getMessages: returning ${items.length} messages, hasMore=${hasMore}`,
      );

      return {
        messages: items.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
        nextCursor,
      };
    } catch (err) {
      if (
        err instanceof NotFoundException ||
        err instanceof ForbiddenException
      ) {
        throw err;
      }
      this.logger.error(
        `Unexpected error in getMessages for chatId=${chatId}`,
        err,
      );
      throw err;
    }
  }
}
