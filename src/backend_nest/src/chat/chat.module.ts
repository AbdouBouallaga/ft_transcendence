import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserPrismaService } from 'src/prisma/user.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatGateway,ChatService, PrismaService, UserPrismaService]
})
export class ChatModule { }
