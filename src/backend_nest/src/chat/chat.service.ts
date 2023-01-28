import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AdminOfChannel, Channel, ChannelType, Message, UserBannedFromChannel, UserBlockedUser } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { BanUserDto, BlockUserDto, ChannelPasswordDto, CreateChannelDto, SendMessageDto, UpdateAdminDto } from './dto';
import { UserPrismaService } from 'src/prisma/user.service';
import { create } from 'domain';

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService,
                private readonly userPrisma: UserPrismaService) { }

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
        await this.prisma.adminOfChannel.create({
            data: {
                channelId: channel.id,
                adminId: user.id
            }
        });
        await this.prisma.memberOfChannel.create({
            data: {
                channelId: channel.id,
                userId: user.id
            }
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
        await this.prisma.adminOfChannel.createMany({
            data: [
                { channelId: channel.id, adminId: user.id },
                { channelId: channel.id, adminId: otherUser.id }
            ]
        });
        await this.prisma.memberOfChannel.createMany({
            data: [
                { channelId: channel.id, userId: user.id },
                { channelId: channel.id, userId: otherUser.id }
            ]
        });
        return channel;
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
        const channel = await this.prisma.channel.findUnique({
            where: {
                id: data.channelId
            }
        });
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
        const channel = await this.prisma.channel.findUnique({
            where: {
                id: data.channelId
            },
            include: {
                AdminOfChannel: true,
                MemberOfChannel: true,
            }
        });
        if (!channel.AdminOfChannel.find(element => element.adminId === user.id)) {
            throw new UnauthorizedException();
        }
        if (!channel.MemberOfChannel.find(element => element.userId === otherUser.id)) {
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
        const channel = await this.prisma.channel.findUnique({
            where: {
                id: data.channelId
            },
            include: {
                AdminOfChannel: true
            }
        });
        if (channel.ownerId !== user.id) {
            throw new UnauthorizedException();
        }
        if (!channel.AdminOfChannel.find(element => element.adminId === otherUser.id)) {
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

    async adminBanUserFromChannel(data: BanUserDto) : Promise<UserBannedFromChannel> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
        const channel = await this.prisma.channel.findUnique({
            where: {
                id: data.channelId
            },
            include: {
                AdminOfChannel: true,
                MemberOfChannel: true
            }
        });
        if (!channel.AdminOfChannel.find(element => element.adminId === user.id)) {
            throw new UnauthorizedException();
        }
        if (!channel.MemberOfChannel.find(element => element.userId === otherUser.id)) {
            throw new UnauthorizedException();
        }
        return await this.prisma.userBannedFromChannel.create({
            data: {
                channelId: channel.id,
                userId: otherUser.id,
                isBanned: data.isBanned,
                duration: data.duration
            }
        });
    }

    async sendMessageToChannel(data: SendMessageDto) : Promise<Message> {
        const user = await this.userPrisma.findUserByLogin42(data.login42);
        const channel = await this.prisma.channel.findUnique({
            where: {
                id: data.channelId
            },
            include: {
                MemberOfChannel: true
            }
        });
        if (!channel.MemberOfChannel.find(element => element.userId === user.id)) {
            throw new UnauthorizedException();
        }
        // check if banned or still muted
        return await this.prisma.message.create({
            data: {
                senderId: user.id,
                channelId: channel.id,
                content: data.content
            }
        });
    }

}
