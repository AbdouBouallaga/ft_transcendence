import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { ChatServerService } from './chat-server.service';
import { EnterRoomDto, SendMessageDto } from './dto';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;
  private users: { login42: string ; socketId: string }[] = [];


  constructor(private readonly chatService: ChatService,
              private readonly chatServerService: ChatServerService) {}  

  @SubscribeMessage('enterRoom')
  handleEnterRoom(@MessageBody() data: EnterRoomDto, @ConnectedSocket() client: Socket) : any {
    console.log("BACK ",`Channel_${data.channelId}`)
    this.server.in(client.id).socketsJoin(`Channel_${data.channelId}`);
  }


  @SubscribeMessage('sendmessage')
  async handlesendmessage(@MessageBody() data :SendMessageDto, @ConnectedSocket() client: Socket)  {
    console.log("sendmessage received", data);
    this.server.to(`Channel_${data.channelId}`).emit("updateChatSection", await this.chatServerService.sendMessage(data));
  }


}
