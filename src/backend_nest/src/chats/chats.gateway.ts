import { WebSocketGateway, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import {WebSocketServer} from "@nestjs/websockets";

@WebSocketGateway()
export class ChatsGateway {
  @WebSocketServer()
  server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): void {
    this.server.emit('message', message);
  }
  constructor(private readonly chatsService: ChatsService) {}

  
}
