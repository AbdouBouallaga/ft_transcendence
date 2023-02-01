import { ChatGateway } from './chat.gateway';
import { Server } from 'socket.io';

describe('ChatGateway', () => {
  let chatGateway: ChatGateway;
  let server: Server;

  beforeEach(() => {
    server = { in: jest.fn(), socketsJoin: jest.fn(), socketsLeave: jest.fn() };
    chatGateway = new ChatGateway();
    chatGateway.server = server;
  });

  it('should add a user to the users array', () => {
    chatGateway.users = [];
    chatGateway.handleMemberJoinRoomChat('user1', 1);
    expect(chatGateway.users).toEqual([{ login42: 'user1', socketId: 'socket1' }]);
  });

  it('should join a socket to a room', () => {
    chatGateway.handleMemberJoinRoomChat('user1', 1);
    expect(server.in).toHaveBeenCalledWith('socket1');
    expect(server.socketsJoin).toHaveBeenCalledWith('chatRoom_1');
  });

  it('should leave a socket from a room', () => {
    chatGateway.handleRemoveSocketIdFromRoom('user1', 1);
    expect(server.in).toHaveBeenCalledWith('socket1');
    expect(server.socketsLeave).toHaveBeenCalledWith('chatRoom_1');
  });
});
