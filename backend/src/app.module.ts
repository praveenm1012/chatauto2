import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health/health.controller';

import { AuthModule } from './auth/auth.module';

import { ChatModule } from './chat/chat.module';

import { MessageModule } from './message/message.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/app_db',
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production',
    }),

    AuthModule,

    ChatModule,

    MessageModule,

  ],
  controllers: [HealthController],
})
export class AppModule {}