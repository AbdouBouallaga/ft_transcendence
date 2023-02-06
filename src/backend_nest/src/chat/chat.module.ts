import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserPrismaService } from 'src/prisma/user.service';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { ChatServerService } from './chat-server.service';

@Module({
  providers: [ChatService, PrismaService, UserPrismaService, ChatGateway, ChatServerService],
  controllers: [ChatController]
})
export class ChatModule { }
