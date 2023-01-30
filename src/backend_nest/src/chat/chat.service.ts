import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminOfChannel, Channel, ChannelType, MemberOfChannel, Message, User, UserBannedFromChannel, UserBlockedUser } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { BanUserDto, BlockUserDto, ChannelPasswordDto, CreateChannelDto, GetMessageDto, InviteUserToChannelDto, MuteUserDto, SendMessageDto, UpdateAdminDto, UserJoinChannelDto } from './dto';
import { UserPrismaService } from 'src/prisma/user.service';

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService,
                private readonly userPrisma: UserPrismaService) { }

    async findChannelById(channelId: number) : Promise<Channel> {
        return await this.prisma.channel.findUnique({
            where: {
                id: channelId,
            }
        });
    }

    async setAdminOfChannel(data: { adminId: number, channelId: number }) : Promise<AdminOfChannel> {
        return await this.prisma.adminOfChannel.create({
            data,
        });
    }

    async addMemberToChannel(data : { userId: number, channelId: number }) : Promise<MemberOfChannel> {
        return await this.prisma.memberOfChannel.create({
            data,
        });
    }

    async rmMemberFromChannel(data: { userId: number, channelId: number }) {
        await this.prisma.memberOfChannel.delete({
            where: {
                channelId_userId: data,
            }
        });
        await this.prisma.adminOfChannel.delete({
            where: {
                channelId_adminId: {
                    adminId: data.userId,
                    channelId: data.channelId
                }
            }
        });
        const channel = await this.findChannelById(data.channelId);
        if (channel.ownerId === data.userId) {
            const randomAdmin = await this.prisma.adminOfChannel.findFirst({
                where: {
                    channelId: channel.id
                }
            });
            if (randomAdmin) {
                await this.prisma.channel.update({
                    where: {
                        id: channel.id,
                    },
                    data: {
                        ownerId: randomAdmin.adminId
                    }
                });
            } else {
                const randomMember = await this.prisma.memberOfChannel.findFirst({
                    where: {
                        channelId: channel.id
                    }
                });
                if (randomMember) {
                    await this.prisma.adminOfChannel.create({
                        data: {
                            adminId: randomMember.userId,
                            channelId: channel.id
                        }
                    });
                    await this.prisma.channel.update({
                        where: {
                            id: channel.id
                        },
                        data: {
                            ownerId: randomMember.userId
                        }
                    });
                } else {
                    await this.prisma.channel.delete({
                        where: {
                            id: channel.id
                        }
                    });
                }
            }
        }
    }

    async isAdminOfChannel(data: { userId: number, channelId: number }) : Promise<boolean> {
        const adminOfChannel = await this.prisma.adminOfChannel.findMany({
            where: {
                adminId: data.userId,
                channelId: data.channelId
            }
        });
        return adminOfChannel.length > 0;
    }

    async isMemberOfChannel(data : { userId: number, channelId: number }) : Promise<boolean> {
        const memberOfChannel = await this.prisma.memberOfChannel.findMany({
            where: {
                userId: data.userId,
                channelId: data.channelId
            }
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
        return typeof userBannedFromChannel.find(element => {
            return element.isBanned;
        }) !== 'undefined';
    }

    async isMutedFromChannel(data: { userId: number, channelId: number }) : Promise<boolean> {
        const userBannedFromChannel = await this.prisma.userBannedFromChannel.findMany({
            where: {
                userId: data.userId,
                channelId: data.channelId
            }
        });
        return typeof userBannedFromChannel.find(element => {
            return new Date(element.startedAt.getTime() + (element.duration * 60000)) >= new Date();
        }) !== 'undefined';
    }

    // TODO: hash password
    async createChannel(data: CreateChannelDto) : Promise<Channel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const channel = await this.prisma.channel.create({
            data: {
                name: data.name,
                type: data.type,
                isProtected: data.isProtected,
                password: data.password,
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

    async createDirectMessage(data: { login42: string, otherLogin42: string }) : Promise<Channel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
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
        if (channel.isProtected) {
            // TODO: hash password
            if (channel.password !== data.password) {
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
        if (!this.isAdminOfChannel({ userId: user.id, channelId: channel.id })) {
            throw new UnauthorizedException();
        }
        return await this.prisma.memberOfChannel.create({
            data: {
                userId: otherUser.id,
                channelId: channel.id
            }
        });
    }

    async blockUser(data: BlockUserDto) : Promise<UserBlockedUser> {
        const blocker = await this.userPrisma.findUserByLogin42(data.blockerLogin42);
        const blockee = await this.userPrisma.findUserByLogin42(data.blockeeLogin42);
        return await this.prisma.userBlockedUser.create({
            data: {
                blockerId: blocker.id,
                blockeeId: blockee.id
            }
        });
    }

    async setChannelPassword(data: ChannelPasswordDto) : Promise<Channel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const channel = await this.findChannelById(data.channelId);
        if (channel.ownerId !== user.id) {
            throw new UnauthorizedException();
        }
        return await this.prisma.channel.update({
            where: {
                id: data.channelId
            },
            data: {
                isProtected: data.isProtected,
                password: data.password
            }
        });
    }

    async upgradeToAdmin(data: UpdateAdminDto) : Promise<AdminOfChannel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
        const channel = await this.findChannelById(data.channelId);
        if (channel.ownerId !== user.id) {
            throw new UnauthorizedException();
        }
        if (!this.isMemberOfChannel({ userId: otherUser.id, channelId: channel.id })) {
            throw new UnauthorizedException();
        }
        return await this.prisma.adminOfChannel.create({
            data: {
                channelId: channel.id,
                adminId: otherUser.id
            }
        });
    }

    async downgradeFromAdmin(data: UpdateAdminDto) : Promise<AdminOfChannel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
        const channel = await this.findChannelById(data.channelId);
        if (channel.ownerId !== user.id) {
            throw new UnauthorizedException();
        }
        if (!this.isAdminOfChannel({ userId: otherUser.id, channelId: channel.id })) {
            throw new UnauthorizedException();
        }
        return await this.prisma.adminOfChannel.delete({
            where: {
                channelId_adminId: {
                    channelId: channel.id,
                    adminId: otherUser.id
                }
            }
        });
    }

    async muteUserFromChannel(data: MuteUserDto): Promise<UserBannedFromChannel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
        const channel = await this.findChannelById(data.channelId);
        if (otherUser.id === channel.ownerId
            || !this.isAdminOfChannel({ userId: user.id, channelId: channel.id })
            || !this.isMemberOfChannel({ userId: otherUser.id, channelId: channel.id })) {
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
            || !this.isAdminOfChannel({ userId: user.id, channelId: channel.id })
            || !this.isMemberOfChannel({ userId: otherUser.id, channelId: channel.id })) {
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
        if (!this.isMemberOfChannel({ userId: user.id, channelId: channel.id })
            || this.isMutedFromChannel({ userId: user.id, channelId: channel.id })) {
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

    // async getMessagesFromChannel(data: GetMessageDto) : Promise<Message[]> {

    // }

    // TODO: userJoinChannel

}
