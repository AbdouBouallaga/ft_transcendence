import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateChannelDto, CreateDmDto } from "./dto";
import { UserPrismaService } from "src/prisma/user.service";
import { Channel, ChannelType, MemberOfChannel, MemberRole, UserBannedFromChannel } from '@prisma/client';
import * as argon from 'argon2';
import { ChannelInfo, Conversation, ConversationMessage, ConversationRole, ConversationUser } from "./interfaces";

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService,
                private readonly userPrisma: UserPrismaService) {}

    async createRoom(data: CreateChannelDto, userId: number) : Promise<Channel> {
        if (await this.channelAlreadyExists(data.name)) {
            throw new BadRequestException();
        }
        let hash = null;
        if (data.isProtected && data.password)
            hash = await argon.hash(data.password);
        const channel = await this.prisma.channel.create({
            data: {
                name: data.name,
                type: data.type,
                isProtected: data.isProtected,
                password: hash
            }
        });
        await this.addMemberToChannel({
            userId: userId,
            channelId: channel.id,
            role: MemberRole.OWNER
        });
        return channel;
    }

    async updateRoom(data: CreateChannelDto, userId: number) : Promise<Channel> {
        if (!(await this.channelAlreadyExists(data.name))) {
            throw new BadRequestException();
        }
        const channel = await this.findChannelByName(data.name);
        if (!(await this.isChannelMemberWithRole({ userId, channelId: channel.id, role: MemberRole.OWNER }))) {
            throw new UnauthorizedException();
        }
        if (!data.password) {
            data.password = channel.password;
        } else {
            data.password = await argon.hash(data.password);
        }
        return await this.prisma.channel.update({
            where: {
                name: data.name
            },
            data: {
                type: data.type,
                isProtected: data.isProtected,
                password: data.password
            }
        });
    }

    async createDirectMessage(data: CreateDmDto, userId: number) : Promise<Channel> {
        const user = await this.userPrisma.findUserById(userId);
        const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
        if (await this.userIsBlockedByUser({ userId, otherUserId: otherUser.id })) {
            throw new UnauthorizedException();
        }
        const dms = await this.prisma.channel.findMany({
            where: {
                OR: [
                    { name: user.login42 + '_' + otherUser.login42 },
                    { name: otherUser.login42 + '_' + user.login42 }
                ]
            }
        });
        if (dms.length > 0) {
            return dms[0];
        }
        const channel = await this.prisma.channel.create({
            data: {
                name: user.login42 + '_' + otherUser.login42,
                type: ChannelType.DIRECT,
                isProtected: false,
                password: null
            }
        });
        await this.addMemberToChannel({ userId: user.id, channelId: channel.id, role: MemberRole.MEMBER });
        await this.addMemberToChannel({ userId: otherUser.id, channelId: channel.id, role: MemberRole.MEMBER });
        return channel;
    }

    async getPublicChannels(userId: number) : Promise<ChannelInfo[]> {
        return (await this.prisma.userBannedFromChannel.findMany({
            where: {
                NOT: { userId, },
                channel: {
                    type: ChannelType.PUBLIC
                }
            },
            select: { channel: true }
        })).map(channel => {
            return new ChannelInfo(channel.channel);
        });
    }

    async getMyChannels(userId: number) : Promise<ChannelInfo[]> {
        const channels = (await this.prisma.channel.findMany({
            where: {
                members: {
                    some: {
                        userId,
                        hasLeft: false
                    }
                },
                bannedUsers: {
                    none: { userId }
                }
            }
        })).map(channel => {
            return new ChannelInfo(channel);
        });
        for (let i = 0; i < channels.length; i++) {
            if (channels[i].type === ChannelType.DIRECT) {
                const members = await this.prisma.memberOfChannel.findMany({
                    where: { channelId: channels[i].id },
                    include: { user: true }
                });
                if (members.length == 0) {
                    continue;
                } else if (members.length > 1 && members[1].user.id !== userId) {
                    channels[i].name = members[1].user.username;
                    channels[i].avatar = members[1].user.avatar;
                } else {
                    channels[i].name = members[0].user.username;
                    channels[i].avatar = members[0].user.avatar;
                }
            }
        }
        channels.forEach(async channel => {
            if (channel.type === ChannelType.DIRECT) {
                const members = await this.prisma.memberOfChannel.findMany({
                    where: { channelId: channel.id },
                    include: { user: true }
                });
                let channelName = members[0].user.username;
                let channelAvatar = members[0].user.avatar;
                for (let i = 1; i < members.length; i++) {
                    channelName = members[i].user.username;
                    channelAvatar = members[i].user.avatar;
                }
            }
        });
        return channels;
    }

    async getFullChannelInfo(channelId: number, userId: number, login42: string) : Promise<Conversation> {
        if (!(await this.channelAlreadyExistsById(channelId))) {
            throw new NotFoundException();
        }
        if (!(await this.isChannelMember({ userId, channelId }))) {
            throw new UnauthorizedException();
        }
        const channel = new ChannelInfo(await this.findChannelById(channelId));
        const members = (await this.prisma.memberOfChannel.findMany({
            where: { channelId },
            include: { user: true }
        })).map(member => {
            let role = ConversationRole.MEMBER;
            if (member.role === MemberRole.OWNER) {
                role = ConversationRole.OWNER;
            } else if (member.role === MemberRole.ADMIN) {
                role = ConversationRole.ADMIN;
            }
            return new ConversationUser(member.user, role);
        });
        const messages = (await this.prisma.message.findMany({
            where: {
                channelId,
            },
            select: {
                content: true,
                createdAt: true,
                sender: true
            }
        })).map(message => {
            return new ConversationMessage(message);
        });
        let channelName = members[0].username;
        let channelAvatar = members[0].avatar;
        if (channel.type === ChannelType.DIRECT) {
            for (let i = 1; i < members.length; i++) {
                if (members[i].login42 !== login42) {
                    channelName = members[i].username;
                    channelAvatar = members[i].avatar;
                }
            }
        }
        return {
            id: channelId,
            name: channelName,
            isDM: channel.type === ChannelType.DIRECT,
            isProtected: channel.isProtected,
            type: channel.type,
            avatar: channelAvatar,
            members,
            messages,
        };
    }

    async addMemberToChannel(data: { userId: number, channelId: number, role: MemberRole }) : Promise<MemberOfChannel> {
        return await this.prisma.memberOfChannel.create({
            data
        });
    }

    async isChannelMember(data: { userId: number, channelId: number }) : Promise<boolean> {
        return (await this.prisma.memberOfChannel.findMany({
            where: {
                channelId: data.channelId,
                userId: data.userId,
                hasLeft: false
            }
        })).length > 0;
    }

    async isChannelMemberWithRole(data: { userId: number, channelId: number, role: MemberRole }) : Promise<boolean> {
        return (await this.prisma.memberOfChannel.findUnique({
            where: {
                channelId_userId: {
                    channelId: data.channelId,
                    userId: data.userId
                }
            }
        })).role === data.role;
    }

    async findChannelByName(channelName: string) : Promise<Channel> {
        return await this.prisma.channel.findUnique({
            where: {
                name: channelName
            }
        });
    }

    async findChannelById(channelId: number) : Promise<Channel> {
        return await this.prisma.channel.findUnique({
            where: {
                id: channelId
            }
        });
    }

    async channelAlreadyExists(channelName: string) : Promise<boolean> {
        const channels = await this.prisma.channel.findMany({
            where: {
                name: channelName
            }
        });
        return channels.length > 0;
    }

    async channelAlreadyExistsById(channelId: number) : Promise<boolean> {
        const channels = await this.prisma.channel.findMany({
            where: {
                id: channelId
            }
        });
        return channels.length > 0;
    }

    async userIsBlockedByUser(data: { userId: number, otherUserId: number }) : Promise<boolean> {
        return (await this.prisma.userBlockedUser.findMany({
            where: {
                OR: [
                    { blockeeId: data.userId, blockerId: data.otherUserId },
                    { blockeeId: data.otherUserId, blockerId: data.userId }
                ]
            }
        })).length > 0;
    }

    async getMembership(data: { userId: number, channelId: number }) : Promise<MemberOfChannel> {
        return await this.prisma.memberOfChannel.findUnique({
            where: {
                channelId_userId: data
            }
        });
    }

    async userIsBannedFromChannel(where: { userId: number, channelId: number }) : Promise<boolean> {
        return (await this.prisma.userBannedFromChannel.findMany({
            where,
        })).length > 0;
    }
}
