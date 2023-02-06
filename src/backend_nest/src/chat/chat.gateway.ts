import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  socketToChannelMap: Map<string, number>;
  socketToLogin42Map: Map<string, string>;

  constructor(private readonly chatService: ChatService) {}  
}
