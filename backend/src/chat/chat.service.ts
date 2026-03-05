import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Chat } from './entities/chat.entity';
import { ChatMember } from './entities/chatmember.entity';
import { User } from './entities/user.entity';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(ChatMember)
    private readonly chatmemberRepository: Repository<ChatMember>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createChat(
    dto: { type: string; name?: string; userIds?: string[] },
    requestingUserId: string,
  ): Promise<{ id: string; type: string; name: string }> {
    this.logger.log(`createChat called by user ${requestingUserId}, type=${dto.type}`);

    try {
      if (dto.type === 'private') {
        if (!dto.userIds || dto.userIds.length !== 1) {
          throw new BadRequestException(
            'Private chat requires exactly one other user.',
          );
        }
      }

      const chat = this.chatRepository.create({
        type: dto.type,
        name: dto.name ?? null,
      });

      const savedChat = await this.chatRepository.save(chat);

      const allUserIds = [requestingUserId, ...(dto.userIds ?? [])];
      for (const userId of allUserIds) {
        const member = this.chatmemberRepository.create({
          chatId: savedChat.chatId,
          userId,
        });
        await this.chatmemberRepository.save(member);
      }

      this.logger.log(`Chat created: ${savedChat.chatId}`);
      return {
        id: savedChat.chatId,
        type: savedChat.type,
        name: savedChat.name ?? '',
      };
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error('Error creating chat', err);
      throw err;
    }
  }

  async listChats(
    userId: string,
  ): Promise<{ chats: { id: string; type: string; name: string }[] }> {
    this.logger.log(`listChats called for user ${userId}`);

    try {
      const memberships = await this.chatmemberRepository.find({
        where: { userId },
      });

      if (!memberships || memberships.length === 0) {
        return { chats: [] };
      }

      const chatIds = memberships.map((m) => m.chatId);

      const chats = await this.chatRepository.find({
        where: { chatId: In(chatIds) },
      });

      return {
        chats: chats.map((chat) => ({
          id: chat.chatId,
          type: chat.type,
          name: chat.name ?? '',
        })),
      };
    } catch (err) {
      this.logger.error(`Error listing chats for user ${userId}`, err);
      throw err;
    }
  }
}
