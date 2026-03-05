import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Chat } from './entities/chat.entity';
import { ChatMember } from './entities/chatmember.entity';
import { User } from './entities/user.entity';

describe('Chat', () => {
  let service: ChatService;
  let controller: ChatController;

  let chatRepository: jest.Mocked<Repository<Chat>>;
  let chatmemberRepository: jest.Mocked<Repository<ChatMember>>;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const mockChatRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findOneOrFail: jest.fn(),
    };

    const mockChatMemberRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findOneOrFail: jest.fn(),
    };

    const mockUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findOneOrFail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        ChatService,
        {
          provide: getRepositoryToken(Chat),
          useValue: mockChatRepository,
        },
        {
          provide: getRepositoryToken(ChatMember),
          useValue: mockChatMemberRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    controller = module.get<ChatController>(ChatController);
    chatRepository = module.get(getRepositoryToken(Chat));
    chatmemberRepository = module.get(getRepositoryToken(ChatMember));
    userRepository = module.get(getRepositoryToken(User));
  });

  describe('ChatService.createChat', () => {
    it('should create a group chat successfully', async () => {
      const dto = { type: 'group', name: 'Test Group', userIds: ['user-2', 'user-3'] };
      const requestingUserId = 'user-1';

      const mockChat: Partial<Chat> = {
        chatId: 'chat-uuid',
        type: 'group',
        name: 'Test Group',
      };

      chatRepository.create.mockReturnValue(mockChat as Chat);
      chatRepository.save.mockResolvedValue(mockChat as Chat);
      chatmemberRepository.create.mockReturnValue({} as ChatMember);
      chatmemberRepository.save.mockResolvedValue({} as ChatMember);

      const result = await service.createChat(dto as any, requestingUserId);

      expect(chatRepository.create).toHaveBeenCalled();
      expect(chatRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'chat-uuid',
        type: 'group',
        name: 'Test Group',
      });
    });

    it('should create a private chat with exactly one other userId', async () => {
      const dto = { type: 'private', name: '', userIds: ['user-2'] };
      const requestingUserId = 'user-1';

      const mockChat: Partial<Chat> = {
        chatId: 'private-chat-uuid',
        type: 'private',
        name: null,
      };

      chatRepository.create.mockReturnValue(mockChat as Chat);
      chatRepository.save.mockResolvedValue(mockChat as Chat);
      chatmemberRepository.create.mockReturnValue({} as ChatMember);
      chatmemberRepository.save.mockResolvedValue({} as ChatMember);

      const result = await service.createChat(dto as any, requestingUserId);

      expect(result.id).toBe('private-chat-uuid');
      expect(result.type).toBe('private');
    });

    it('should throw BadRequestException for private chat with wrong number of userIds', async () => {
      const dto = { type: 'private', name: '', userIds: ['user-2', 'user-3'] };
      const requestingUserId = 'user-1';

      await expect(service.createChat(dto as any, requestingUserId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for private chat with no userIds', async () => {
      const dto = { type: 'private', name: '', userIds: [] };
      const requestingUserId = 'user-1';

      await expect(service.createChat(dto as any, requestingUserId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('ChatService.listChats', () => {
    it('should return list of chats for the user', async () => {
      const userId = 'user-1';

      const mockMemberships: Partial<ChatMember>[] = [
        { memberId: 'm-1', chatId: 'chat-1', userId: 'user-1' },
        { memberId: 'm-2', chatId: 'chat-2', userId: 'user-1' },
      ];

      const mockChats: Partial<Chat>[] = [
        { chatId: 'chat-1', type: 'group', name: 'Group 1' },
        { chatId: 'chat-2', type: 'private', name: null },
      ];

      chatmemberRepository.find.mockResolvedValue(mockMemberships as ChatMember[]);
      chatRepository.find.mockResolvedValue(mockChats as Chat[]);

      const result = await service.listChats(userId);

      expect(chatmemberRepository.find).toHaveBeenCalledWith({ where: { userId } });
      expect(result.chats).toHaveLength(2);
      expect(result.chats[0]).toEqual({ id: 'chat-1', type: 'group', name: 'Group 1' });
      expect(result.chats[1]).toEqual({ id: 'chat-2', type: 'private', name: '' });
    });

    it('should return empty chats array when user has no memberships', async () => {
      const userId = 'user-no-chats';

      chatmemberRepository.find.mockResolvedValue([]);

      const result = await service.listChats(userId);

      expect(result).toEqual({ chats: [] });
      expect(chatRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('ChatController', () => {
    it('should call service.createChat and return result', async () => {
      const dto = { type: 'group', name: 'My Group', userIds: ['user-2'] };
      const req = { user: { id: 'user-1' } };
      const expected = { id: 'chat-uuid', type: 'group', name: 'My Group' };

      jest.spyOn(service, 'createChat').mockResolvedValue(expected);

      const result = await controller.createChat(dto as any, req);

      expect(service.createChat).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual(expected);
    });

    it('should call service.listChats and return result', async () => {
      const req = { user: { id: 'user-1' } };
      const expected = {
        chats: [{ id: 'chat-1', type: 'group', name: 'Group 1' }],
      };

      jest.spyOn(service, 'listChats').mockResolvedValue(expected);

      const result = await controller.listChats(req);

      expect(service.listChats).toHaveBeenCalledWith('user-1');
      expect(result).toEqual(expected);
    });
  });
});
