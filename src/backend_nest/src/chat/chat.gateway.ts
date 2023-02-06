import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { ChatServerService } from './chat-server.service';
import { SendMessageDto } from './dto';

@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  socketToChannelMap: Map<string, number>;
  socketToLogin42Map: Map<string, string>;

  constructor(private readonly chatService: ChatService,
              private readonly chatServerService: ChatServerService) {}  

  // @SubscribeMessage('enterRoom')
  // handleEnterRoom(@MessageBody() data: EnterRoomDto, @ConnectedSocket() client: Socket) : any {
  //   this.socketToChannelMap.set(client.id, data.channelId);
  //   this.socketToLogin42Map.set(client.id, data.login42);
  //   this.server.in(client.id).socketsJoin(`Channel_${data.channelId}`);
  // }
  @SubscribeMessage('sendmessage')
  async handlesendmessage(@MessageBody() data :SendMessageDto, @ConnectedSocket() client: Socket)  {
    console.log("sendmessage received", data);
    await this.chatServerService.sendMessage(data);
    client.emit("updateChatSection", "fg");
  }


}
