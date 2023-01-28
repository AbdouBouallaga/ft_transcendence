import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserPrismaService } from 'src/prisma/user.service';
import { ChatService } from './chat.service';

@Module({
  providers: [ChatService, PrismaService, UserPrismaService]
})
export class ChatModule { }
