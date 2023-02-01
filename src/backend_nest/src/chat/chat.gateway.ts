import { SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from "@nestjs/websockets";
import { Logger, UnauthorizedException } from "@nestjs/common";
import { Socket, Server } from "socket.io";
import { MemberOfChannel, Message, conversation } from "@prisma/client";

@WebSocketGateway()
export class ChatGateway {

    @WebSocketServer()
    public server: Server;
    public  users: { login42: string; socketId: string }[] = [];
    public logger: Logger = new Logger("AppGateway");

    afterInit(server: Server) {
        this.logger.log("AppGateway init");
    }
    getSocketIdFromUserId(userId: string) {
        return this.users.find((u) => u.login42 === userId)?.socketId;
  }

    handleMemberJoinRoomChat(userId: string, conversationId: number) {
        const socketId = this.getSocketIdFromUserId(userId);
        if (socketId) this.server.in(socketId).socketsJoin(`chatRoom_${conversationId}`);
    }

    // handleUserInRoom(userId: string, conversationId: number) {
    //     return new Promise((resolve, reject) => {
    //         const socketId = this.getSocketIdFromUserId(userId);
    //         if (!socketId) return reject({ Message: "unauthorized" });
    //         if (!this.server.sockets.adapter.socketRooms(socketId).has(`chatRoom_${conversationId}`))
    //             return reject({ message: "unauthorized" });
    //         return resolve(socketId);
    //     });
    // }
    // handleEmitNewMessage(message: Message) {
    //     const socketId = this.getSocketIdFromUserId(message.senderId);
    //     this.server.to(`chatRoom_${message.conversationid}`).except(socketId).emit("newMessage", message);
    // }

    // handleEmitUpdateConversation(update: conversation & { MemberOfChannel: MemberOfChannel[] }, userId: string) {
    //     const socketId = this.getSocketIdFromUserId(userId);
    //     const ids = update.MemberOfChannel
    //         .map((m) => m.active && this.getSocketIdFromUserId(m.userId))
    //         .filter((i) => i !== undefined);

    //     this.server.to(ids).except(socketId).emit("updateConversation", update);
    // }

    handleRemoveSocketIdFromRoom(userId: string, conversationId: number) {
        const socketId = this.getSocketIdFromUserId(userId);
        if (socketId) this.server.in(socketId).socketsLeave(`chatRoom_${conversationId}`);
    }

    // handlePasswordChanged(userId: string, conversationId: number) {
    //     const socketId = this.getSocketIdFromUserId(userId);
    //     this.server.in(`chatRoom_${conversationId}`).except(socketId).emit("passwordChanged", conversationId);
    //     this.server.in(`chatRoom_${conversationId}`).except(socketId).socketsLeave(`chatRoom_${conversationId}`);
    // }
}