import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

describe('Auth', () => {
  let service: AuthService;
  let controller: AuthController;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const mockUserRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findOneOrFail: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    controller = module.get<AuthController>(AuthController);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  // ── Register Tests ──────────────────────────────────────────────────────

  describe('register', () => {
    it('should register a new user and return id and email', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'securePassword123',
      };

      const savedUser: User = {
        id: 'uuid-1234',
        email: registerDto.email,
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findOne.mockResolvedValue(null);
      userRepository.create.mockReturnValue(savedUser);
      userRepository.save.mockResolvedValue(savedUser);

      const result = await service.register(registerDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: savedUser.id, email: savedUser.email });
    });

    it('should throw ConflictException if email already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'securePassword123',
      };

      const existingUser: User = {
        id: 'uuid-existing',
        email: registerDto.email,
        passwordHash: 'hashed_password',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('controller should call service.register and return result', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'securePassword123',
      };

      const expectedResult = { id: 'uuid-1234', email: registerDto.email };
      jest.spyOn(service, 'register').mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  // ── Login Tests ─────────────────────────────────────────────────────────

  describe('login', () => {
    it('should return an accessToken for valid credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'securePassword123',
      };

      const hashedPassword = await bcrypt.hash(loginDto.password, 10);
      const user: User = {
        id: 'uuid-1234',
        email: loginDto.email,
        passwordHash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findOne.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('signed.jwt.token');

      const result = await service.login(loginDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
      });
      expect(result).toEqual({ accessToken: 'signed.jwt.token' });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent@example.com',
        password: 'somePassword',
      };

      userRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongPassword',
      };

      const hashedPassword = await bcrypt.hash('correctPassword', 10);
      const user: User = {
        id: 'uuid-1234',
        email: loginDto.email,
        passwordHash: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      userRepository.findOne.mockResolvedValue(user);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('controller should call service.login and return accessToken', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'securePassword123',
      };

      const expectedResult = { accessToken: 'signed.jwt.token' };
      jest.spyOn(service, 'login').mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });
});
