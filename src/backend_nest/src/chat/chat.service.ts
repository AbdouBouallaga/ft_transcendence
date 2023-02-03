import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  AdminOfChannel,
  Channel,
  ChannelType,
  MemberOfChannel,
  Message,
  User,
  UserBannedFromChannel,
  UserBlockedUser,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { BanUserDto, BlockUserDto, ChannelPasswordDto, CreateChannelDto, CreateDmDto, InviteUserToChannelDto, MuteUserDto, SendMessageDto, UpdateAdminDto, UserJoinChannelDto } from './dto';
import { UserPrismaService } from 'src/prisma/user.service';
import * as argon from 'argon2';
import { ChannelInfo, Conversation, ConversationMessage } from './interfaces';
import { UserProfile } from 'src/users/interfaces';

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userPrisma: UserPrismaService,
  ) {}

    async createRoom(data: CreateChannelDto) : Promise<Channel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const room = await this.prisma.channel.findMany({
            where: {
                name: data.name
            }
        });
        if (room.length > 0)
            throw new BadRequestException();
        let hash = null;
        if (data.password)
            hash = await argon.hash(data.password);
        const channel = await this.prisma.channel.create({
            data: {
                name: data.name,
                type: data.type,
                isProtected: data.isProtected,
                password: hash,
                ownerId: user.id
            }
        });
        await this.setAdminOfChannel({
            adminId: user.id,
            channelId: channel.id
        });
        await this.addMemberToChannel({
            userId: user.id,
            channelId: channel.id
        });
        return channel;
    }

    async createDirectMessage(data: CreateDmDto) : Promise<Channel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
        const dm = await this.prisma.channel.findMany({
            where: {
                OR: [
                    {
                        name: user.login42 + "_" + otherUser.login42
                    },
                    {
                        name: otherUser.login42 + "_" + user.login42
                    }
                ]
            }
        });
        if (dm.length > 0)
            return dm[0];
        const channel = await this.prisma.channel.create({
            data: {
                name: user.login42 + "_" + otherUser.login42,
                type: ChannelType.DIRECT,
                isProtected: false,
                password: null,
                ownerId: user.id
            }
        });
        await this.setAdminOfChannel({
            adminId: user.id,
            channelId: channel.id
        });
        await this.setAdminOfChannel({
            adminId: otherUser.id,
            channelId: channel.id
        });
        await this.addMemberToChannel({
            userId: user.id,
            channelId: channel.id
        });
        await this.addMemberToChannel({
            userId: otherUser.id,
            channelId: channel.id
        });
        return channel;
    }

    async userJoinChannel(data: UserJoinChannelDto) : Promise<MemberOfChannel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const channel = await this.findChannelById(data.channelId);
        if (await this.isMemberOfChannel({ userId: user.id, channelId: data.channelId})) {
            return await this.prisma.memberOfChannel.findUnique({
                where: {
                    channelId_userId: {
                        channelId: data.channelId,
                        userId: user.id
                    }
                }
            });
        }
        if (await this.isBannedFromChannel({ userId: user.id, channelId: channel.id }))
            throw new UnauthorizedException();
        if (channel.isProtected) {
            const verified = await argon.verify(channel.password, data.password);
            if (!verified) {
                throw new UnauthorizedException();
            }
        }
        return await this.prisma.memberOfChannel.create({
            data: {
                userId: user.id,
                channelId: channel.id
            }
        });
    }

    async inviteUserToChannel(data: InviteUserToChannelDto) : Promise<MemberOfChannel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
        const channel = await this.findChannelById(data.channelId);
        if (!( await this.isAdminOfChannel({ userId: user.id, channelId: channel.id }))
            || (await this.isBannedFromChannel({ userId: user.id, channelId: channel.id }))) {
            throw new UnauthorizedException();
        }
        return await this.prisma.memberOfChannel.create({
            data: {
                userId: otherUser.id,
                channelId: channel.id
            }
        });
    }

  async blockUser(data: BlockUserDto): Promise<UserBlockedUser> {
    const blocker = await this.userPrisma.findUserByLogin42(
      data.blockerLogin42,
    );
    const blockee = await this.userPrisma.findUserByLogin42(
      data.blockeeLogin42,
    );
    return await this.prisma.userBlockedUser.create({
      data: {
        blockerId: blocker.id,
        blockeeId: blockee.id,
      },
    });
  }

  async setChannelPassword(data: ChannelPasswordDto): Promise<Channel> {
    const user = await this.userPrisma.findUserByLogin42(data.login42);
    const channel = await this.findChannelById(data.channelId);
    if (channel.ownerId !== user.id) {
      throw new UnauthorizedException();
    }
    return await this.prisma.channel.update({
      where: {
        id: data.channelId,
      },
      data: {
        isProtected: data.isProtected,
        password: data.password,
      },
    });
  }

    async upgradeToAdmin(data: UpdateAdminDto) : Promise<AdminOfChannel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
        const channel = await this.findChannelById(data.channelId);
        if (channel.ownerId !== user.id) {
            throw new UnauthorizedException();
        }
        if (!( await this.isMemberOfChannel({ userId: otherUser.id, channelId: channel.id }))) {
            throw new UnauthorizedException();
        }
        return await this.prisma.adminOfChannel.create({
            data: {
                channelId: channel.id,
                adminId: otherUser.id
            }
        });
    }

  async downgradeFromAdmin(data: UpdateAdminDto): Promise<AdminOfChannel> {
    const user = await this.userPrisma.findUserByLogin42(data.login42);
    const otherUser = await this.userPrisma.findUserByLogin42(
      data.otherLogin42,
    );
    const channel = await this.findChannelById(data.channelId);
    if (channel.ownerId !== user.id) {
      throw new UnauthorizedException();
    }
    if (
      !this.isAdminOfChannel({ userId: otherUser.id, channelId: channel.id })
    ) {
      throw new UnauthorizedException();
    }
    return await this.prisma.adminOfChannel.delete({
      where: {
        channelId_adminId: {
          channelId: channel.id,
          adminId: otherUser.id,
        },
      },
    });
  }

    async muteUserFromChannel(data: MuteUserDto): Promise<UserBannedFromChannel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
        const channel = await this.findChannelById(data.channelId);
        if (otherUser.id === channel.ownerId
            || !(await this.isAdminOfChannel({ userId: user.id, channelId: channel.id }))
            || !(await this.isMemberOfChannel({ userId: otherUser.id, channelId: channel.id }))) {
            throw new UnauthorizedException();
        }
        return await this.prisma.userBannedFromChannel.create({
            data: {
                channelId: channel.id,
                userId: otherUser.id,
                duration: data.duration
            }
        });
    }

    async banUserFromChannel(data: BanUserDto) : Promise<UserBannedFromChannel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
        const channel = await this.findChannelById(data.channelId);
        if (otherUser.id === channel.ownerId
            || !(await this.isAdminOfChannel({ userId: user.id, channelId: channel.id }))
            || !(await this.isMemberOfChannel({ userId: otherUser.id, channelId: channel.id }))) {
            throw new UnauthorizedException();
        }
        const userBannedFromChannel = await this.prisma.userBannedFromChannel.create({
            data: {
                channelId: channel.id,
                userId: otherUser.id,
                isBanned: true,
            }
        });
        await this.rmMemberFromChannel({ userId: otherUser.id, channelId: channel.id });
        return userBannedFromChannel;
    }

    async sendMessageToChannel(data: SendMessageDto) : Promise<Message> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const channel = await this.findChannelById(data.channelId);
        if (!(await this.isMemberOfChannel({ userId: user.id, channelId: channel.id }))
            || (await this.isMutedFromChannel({ userId: user.id, channelId: channel.id }))
            || (await this.isBannedFromChannel({ userId: user.id, channelId: channel.id }))) {
            throw new UnauthorizedException();
        }
        if (channel.type === ChannelType.DIRECT) {
            const otherUser = (await this.prisma.memberOfChannel.findFirst({
                where: {
                    channelId: channel.id,
                    userId: {
                        not: user.id
                    }
                },
                select: {
                    user: true,
                }
            })).user;
            const userBlockedByUser = await this.prisma.userBlockedUser.findMany({
                where: {
                    blockerId: otherUser.id,
                    blockeeId: user.id
                }
            });
            if (userBlockedByUser.length > 0) {
                throw new UnauthorizedException();
            }
        }
        return await this.prisma.message.create({
            data: {
                senderId: user.id,
                channelId: channel.id,
                content: data.content
            }
        });
    }

    async getFullChannelInfo(channelId: number, userId: number) : Promise<Conversation> {
        const channel = await this.prisma.channel.findUnique({
            where: {
                id: channelId
            }
        });
        if (!(await this.isMemberOfChannel({ userId, channelId })))
            throw new UnauthorizedException();
        const admins = (await this.prisma.adminOfChannel.findMany({
            where: {
                channelId,
            },
            select: {
                admin: true
            }
        })).map(admin => {
            return new UserProfile(admin.admin);
        });
        const members = (await this.prisma.memberOfChannel.findMany({
            where: {
                channelId
            },
            select: {
                user: true
            }
        })).map(member => {
            return new UserProfile(member.user);
        });
        const messages = (await this.prisma.message.findMany({
            where: {
                channelId: channelId
            },
            select: {
                content: true,
                createdAt: true,
                sender: true
            }
        })).map(message => {
            return new ConversationMessage(message);
        });
        return {
            id: channelId,
            owner: new UserProfile(await this.userPrisma.findUserById(channel.ownerId)),
            admins,
            members,
            messages
        }; 
    }

    async getPublicChannels(userId: number) : Promise<ChannelInfo[]> {
        return (await this.prisma.userBannedFromChannel.findMany({
            where: {
                NOT: {
                    userId
                },
                channel: {
                    type: ChannelType.PUBLIC
                }
            },
            select: {
                channel: true
            }
        })).map(element => {
            return new ChannelInfo(element.channel);
        });
    }

  async getMyChannels(userId: number): Promise<Channel[]> {
    const memberOfChannels = await this.prisma.memberOfChannel.findMany({
      where: {
        userId,
      },
      select: {
        channel: true,
      },
    });
    return memberOfChannels.map((element) => {
      return element.channel;
    });
  }

  async findChannelById(channelId: number): Promise<Channel> {
    return await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });
  }

  async setAdminOfChannel(data: {
    adminId: number;
    channelId: number;
  }): Promise<AdminOfChannel> {
    if (
      await this.isAdminOfChannel({
        userId: data.adminId,
        channelId: data.channelId,
      })
    ) {
      return await this.prisma.adminOfChannel.findUnique({
        where: {
          channelId_adminId: data,
        },
      });
    }
    return await this.prisma.adminOfChannel.create({
      data,
    });
  }

  async addMemberToChannel(data: {
    userId: number;
    channelId: number;
  }): Promise<MemberOfChannel> {
    if (await this.isMemberOfChannel(data)) {
      return await this.prisma.memberOfChannel.findUnique({
        where: {
          channelId_userId: data,
        },
      });
    }
    return await this.prisma.memberOfChannel.create({
      data,
    });
  }

  async rmMemberFromChannel(data: { userId: number; channelId: number }) {
    await this.prisma.memberOfChannel.delete({
      where: {
        channelId_userId: data,
      },
    });
    await this.prisma.adminOfChannel.delete({
      where: {
        channelId_adminId: {
          adminId: data.userId,
          channelId: data.channelId,
        },
      },
    });
    const channel = await this.findChannelById(data.channelId);
    if (channel.ownerId === data.userId) {
      const randomAdmin = await this.prisma.adminOfChannel.findFirst({
        where: {
          channelId: channel.id,
        },
      });
      if (randomAdmin) {
        await this.prisma.channel.update({
          where: {
            id: channel.id,
          },
          data: {
            ownerId: randomAdmin.adminId,
          },
        });
      } else {
        const randomMember = await this.prisma.memberOfChannel.findFirst({
          where: {
            channelId: channel.id,
          },
        });
        if (randomMember) {
          await this.prisma.adminOfChannel.create({
            data: {
              adminId: randomMember.userId,
              channelId: channel.id,
            },
          });
          await this.prisma.channel.update({
            where: {
              id: channel.id,
            },
            data: {
              ownerId: randomMember.userId,
            },
          });
        } else {
          await this.prisma.channel.delete({
            where: {
              id: channel.id,
            },
          });
        }
      }
    }
  }

  async isAdminOfChannel(data: {
    userId: number;
    channelId: number;
  }): Promise<boolean> {
    const adminOfChannel = await this.prisma.adminOfChannel.findMany({
      where: {
        adminId: data.userId,
        channelId: data.channelId,
      },
    });
    return adminOfChannel.length > 0;
  }

  async isMemberOfChannel(data: {
    userId: number;
    channelId: number;
  }): Promise<boolean> {
    const memberOfChannel = await this.prisma.memberOfChannel.findMany({
      where: {
        userId: data.userId,
        channelId: data.channelId,
      },
    });
    return memberOfChannel.length > 0;
  }

    async isBannedFromChannel(data: { userId: number, channelId: number }) : Promise<boolean> {
        const userBannedFromChannel = await this.prisma.userBannedFromChannel.findMany({
            where: {
                userId: data.userId,
                channelId: data.channelId
            }
        });
        return userBannedFromChannel.filter(element => {
            return element.isBanned;
        }).length > 0;
    }

    async isMutedFromChannel(data: { userId: number, channelId: number }) : Promise<boolean> {
        const userBannedFromChannel = await this.prisma.userBannedFromChannel.findMany({
            where: {
                userId: data.userId,
                channelId: data.channelId
            }
        });
        return userBannedFromChannel.filter(element => {
            return new Date(element.startedAt.getTime() + (element.duration * 60000)) >= new Date();
        }).length > 0;
    }
}
