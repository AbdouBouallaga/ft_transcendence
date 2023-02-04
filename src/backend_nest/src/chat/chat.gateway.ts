import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Logger, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Socket, Server } from "socket.io";
import { JwtStrategy } from "src/auth/strategies";
import { ChatService } from "./chat.service";
import { UsePipes } from "@nestjs/common";
import { UserPrismaService } from "src/prisma/user.service";
import { channel } from "diagnostics_channel";


@WebSocketGateway({ namespace: 'chat' })
export class ChatGateway {
    constructor(private readonly chatService: ChatService,
        private readonly userService: UserPrismaService) { }

    @WebSocketServer()
    public server: Server;
    private users: { login42: string ; socketId: string }[] = [];
    private logger: Logger = new Logger("AppGateway");

    onModuleInit() {
        this.server.on('connection', async (socket) => {
            this.server.emit("connected with id", socket.id);
            socket.on('initUser', (data) => {
                socket.login42 = data.login42;
                const userIndex = this.users.findIndex((u) => u.socketId === socket.id);
            
                
                if (userIndex > -1) {
                    this.users[userIndex].login42 = socket.login42;
                    console.log(" 2 --->>", this.users);
                } else {
                    this.users.push({ login42: socket.login42, socketId: socket.id });
                    console.log(">>>>", this.users);
                }
                const socketId = this.getSocketIdFromUserId(data.login42)
                console.log("--->> ", socketId , data.login42);
            });
        });
    }
     async handleDisconnect(client: Socket) {
        const userIndex = this.users.findIndex((u) => u.socketId === client.id);
        if (userIndex > -1) {
            const { login42 } = this.users[userIndex];
            this.users.splice(userIndex, 1);
            this.server.to("online").emit("userChangeStatus", { login42 });
        }
    }
     private disconnect(socket: Socket) {
        socket.emit("error", new UnauthorizedException());
        socket.disconnect();
    }
    // getSocketIdFromUserId(userId: string) {
    //     return this.users.find((u) => u.login42 === userId)?.socketId;
    // }
    @SubscribeMessage('hello')
    handlehello(data: any): string {
        console.log("hello from", data.login42)
        this.server.emit("hallo", data)
        return data;
    };


    handleMemberJoinRoomChat(userId: string, channelId: number) {
        const socketId = this.getSocketIdFromUserId(userId);
        // user needs to be added in DB
        if (socketId) this.server.in(socketId).socketsJoin(`chatRoom_${channelId}`);
    }

    handleUserInRoom(userId: string, channelId: number) {
        return new Promise((resolve, reject) => {
            const socketId = this.getSocketIdFromUserId(userId);
            if (!socketId) return reject({ Message: "unauthorized" });
            if (!this.server.sockets.adapter.socketRooms(socketId).has(`chatRoom_${channelId}`))
                return reject({ message: "unauthorized" });
            return resolve(socketId);
        });
    }

        async handleSendMessageToChannel(data: { login42: string, channelId: number, content: string }) {
            const message = await this.chatService.sendMessageToChannel(data);
            // const socketId = this.getSocketIdFromUserId(message.senderId);
            // msg need to be inserted in DB
            this.server.to(`chatRoom_${data.channelId}`).emit("newMessage", message);
        }

    //     /// to do ADD admin 
    // async  handleAddMemberToChannel(data: { username: string, channelId: number }) {
    //     const user = await this.userService.findUserByUsername(data.username); // TODO(ayoub)
    //     await this.chatService.addMemberToChannel({ userId: user.id, channelId: data.channelId });
    //     const socketId = this.getSocketIdFromUserId(user.login42);
    //     if (!socketId)
    //         return;
    //     this.server.to(socketId).emit('addedTochannel', data.channelId);
    // }
        
        handleRemoveSocketIdFromRoom(userId: string, channelId: number) {
            const socketId = this.getSocketIdFromUserId(userId);
            if (socketId) this.server.in(socketId).socketsLeave(`chatRoom_${channelId}`);
        }

        handlePasswordChanged(userId: string, channelId: number) {
            const socketId = this.getSocketIdFromUserId(userId);
            this.server.in(`chatRoom_${channelId}`).except(socketId).emit("passwordChanged", channelId);
            // update password in DB.
            this.server.in(`chatRoom_${channelId}`).except(socketId).socketsLeave(`chatRoom_${channelId}`);
        }
        getSocketIdFromUserId(userId: string) {
            return this.users.find((u) => u.login42 === userId)?.socketId;
        }

        // @SubscribeMessage("leaveChatRoom")
        // async handleLeftCahtRoom(client: Socket,) {
        //     try {
        //         await client.leave(`chatRoom_${}`);
        //     } catch (error) {
        //         throw new WsException(error);
        //     }
        // }
}