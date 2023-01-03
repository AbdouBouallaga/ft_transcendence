import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ChatController } from './chat.controller';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
@Module({
  imports: [PrismaModule],
  controllers: [ChatController],
  providers: [ChatsGateway, ChatsService],
})
export class ChatModule {}
