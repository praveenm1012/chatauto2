import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message } from './entities/message.entity';
import { User } from './entities/user.entity';

describe('Message', () => {
  let service: MessageService;
  let controller: MessageController;
  let messageRepository: jest.Mocked<Repository<Message>>;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: User = {
    id: 'user-1',
    email: 'alice@example.com',
    passwordHash: 'hashed',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  };

  const mockMessage: Message = {
    id: 'msg-1',
    chatId: 'chat-1',
    senderId: 'user-1',
    content: 'Hello world',
    createdAt: new Date('2024-06-01T12:00:00.000Z'),
    updatedAt: new Date('2024-06-01T12:00:00.000Z'),
  };

  beforeEach(async () => {
    const mockMessageRepository = {
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
      controllers: [MessageController],
      providers: [
        MessageService,
        {
          provide: getRepositoryToken(Message),
          useValue: mockMessageRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    controller = module.get<MessageController>(MessageController);
    messageRepository = module.get(getRepositoryToken(Message));
    userRepository = module.get(getRepositoryToken(User));
  });

  // ── Service tests ─────────────────────────────────────────────────────────

  describe('MessageService.getMessages', () => {
    it('should return paginated messages for a valid member', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      // membership check returns a message
      messageRepository.findOne.mockResolvedValue(mockMessage);
      // page query returns one message
      messageRepository.find.mockResolvedValue([mockMessage]);

      const result = await service.getMessages('chat-1', 'user-1', 20);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].id).toBe('msg-1');
      expect(result.messages[0].senderId).toBe('user-1');
      expect(result.messages[0].content).toBe('Hello world');
      expect(result.nextCursor).toBeNull();
    });

    it('should return nextCursor when there are more pages', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      messageRepository.findOne.mockResolvedValue(mockMessage);

      // Return limit+1 messages to signal there is a next page
      const messages: Message[] = Array.from({ length: 3 }, (_, i) => ({
        ...mockMessage,
        id: `msg-${i}`,
        createdAt: new Date(`2024-06-0${i + 1}T12:00:00.000Z`),
        updatedAt: new Date(`2024-06-0${i + 1}T12:00:00.000Z`),
      }));
      messageRepository.find.mockResolvedValue(messages); // 3 rows for limit=2

      const result = await service.getMessages('chat-1', 'user-1', 2);

      expect(result.messages).toHaveLength(2);
      expect(result.nextCursor).not.toBeNull();
    });

    it('should throw NotFoundException when requesting user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getMessages('chat-1', 'unknown-user', 20),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when user is not a chat member', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      // membership check returns null → not a member
      messageRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getMessages('chat-1', 'user-1', 20),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should pass cursor to repository query', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      messageRepository.findOne.mockResolvedValue(mockMessage);
      messageRepository.find.mockResolvedValue([mockMessage]);

      const cursor = '2024-06-01T12:00:00.000Z';
      await service.getMessages('chat-1', 'user-1', 20, cursor);

      expect(messageRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ chatId: 'chat-1' }),
        }),
      );
    });
  });

  // ── Controller tests ──────────────────────────────────────────────────────

  describe('MessageController.getMessages', () => {
    it('should delegate to service and return result', async () => {
      const expected = {
        messages: [
          {
            id: 'msg-1',
            senderId: 'user-1',
            content: 'Hello world',
            createdAt: '2024-06-01T12:00:00.000Z',
          },
        ],
        nextCursor: null,
      };

      jest.spyOn(service, 'getMessages').mockResolvedValue(expected);

      const req = { user: { id: 'user-1' } };
      const result = await controller.getMessages('chat-1', req, undefined, undefined);

      expect(service.getMessages).toHaveBeenCalledWith('chat-1', 'user-1', 20, undefined);
      expect(result).toEqual(expected);
    });

    it('should pass limit and cursor query params to service', async () => {
      const expected = { messages: [], nextCursor: null };
      jest.spyOn(service, 'getMessages').mockResolvedValue(expected);

      const req = { user: { id: 'user-1' } };
      await controller.getMessages('chat-1', req, '2024-06-01T12:00:00.000Z', '10');

      expect(service.getMessages).toHaveBeenCalledWith(
        'chat-1',
        'user-1',
        10,
        '2024-06-01T12:00:00.000Z',
      );
    });

    it('should propagate ForbiddenException from service', async () => {
      jest
        .spyOn(service, 'getMessages')
        .mockRejectedValue(new ForbiddenException('You are not a member of this chat'));

      const req = { user: { id: 'user-1' } };
      await expect(
        controller.getMessages('chat-1', req, undefined, undefined),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
