import { ChannelType, User } from '@prisma/client';

export enum ConversationRole {
  MEMBER,
  ADMIN,
  OWNER,
}

export class ConversationUser {
  username: string;
  login42: string;
  avatar: string;
  role: ConversationRole;

  constructor(user: User, role: ConversationRole) {
    this.username = user.username;
    this.login42 = user.login42;
    this.avatar = user.avatar;
    this.role = role;
  }
}

export class ConversationMessage {
  login42: string;
  username: string;
  date: Date;
  message: string;

  constructor(message: any) {
    this.login42 = message.sender.login42;
    this.username = message.sender.username;
    this.date = message.createdAt;
    this.message = message.content;
  }
}

export class Conversation {
  id: number;
  name: string;
  avatar: string;
  isDM: boolean;
  type: ChannelType;
  isProtected: boolean;
  members: ConversationUser[];
  messages: ConversationMessage[];
}
