import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ id: string; email: string }> {
    const { email, password } = registerDto;
    this.logger.log(`Register attempt for email: ${email}`);

    try {
      const existing = await this.userRepository.findOne({ where: { email } });
      if (existing) {
        this.logger.warn(`Registration failed – email already in use: ${email}`);
        throw new ConflictException('Email already in use');
      }

      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      const newUser = this.userRepository.create({ email, passwordHash });
      const saved: User = await this.userRepository.save(newUser);

      this.logger.log(`User registered successfully: ${saved.id}`);
      return { id: saved.id, email: saved.email };
    } catch (err) {
      if (err instanceof ConflictException) throw err;
      this.logger.error(`Unexpected error during registration for ${email}`, err);
      throw err;
    }
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const { email, password } = loginDto;
    this.logger.log(`Login attempt for email: ${email}`);

    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        this.logger.warn(`Login failed – user not found: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        this.logger.warn(`Login failed – wrong password for: ${email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(payload);

      this.logger.log(`Login successful for user: ${user.id}`);
      return { accessToken };
    } catch (err) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.error(`Unexpected error during login for ${email}`, err);
      throw err;
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    try {
      return (await this.userRepository.findOne({ where: { email } })) ?? null;
    } catch (err) {
      this.logger.error(`Error finding user by email: ${email}`, err);
      throw err;
    }
  }
}
