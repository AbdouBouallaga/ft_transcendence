import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ChannelType, MemberOfChannel, MemberRole, Message, UserBannedFromChannel } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { EnterRoomDto, JoinChannelDto, SendMessageDto, UserOnUserActionDto } from './dto';
import { UserPrismaService } from 'src/prisma/user.service';
import { ChatService } from './chat.service';
import { ConversationMessage } from './interfaces';
import * as argon from 'argon2';

@Injectable()
export class ChatServerService {
	constructor(private readonly prisma: PrismaService,
				private readonly userPrisma: UserPrismaService,
				private readonly chatService: ChatService) {}

	// sendMessage
	async sendMessage(data: SendMessageDto) : Promise<ConversationMessage> {
		const user = await this.userPrisma.findUserByLogin42(data.login42);
		if (!(await this.chatService.isChannelMember({ userId: user.id, channelId: data.channelId }))) {
			throw new BadRequestException();
		}
		const membership = await this.chatService.getMembership({ userId: user.id, channelId: data.channelId });
		if (membership.isMuted
			|| (await this.chatService.userIsBannedFromChannel({ userId: user.id, channelId: data.channelId }))) {
			throw new UnauthorizedException();
		}
		const channel = await this.chatService.findChannelById(data.channelId);
		if (channel.type === ChannelType.DIRECT) {
			const members = await this.prisma.memberOfChannel.findMany({
				where: { channelId: data.channelId },
				select: { user: true }
			});
			let otherUser = members[0].user;
			for (let i = 0; i < members.length; i++) {
				if (members[i].user.id !== user.id) {
					otherUser = members[i].user;
					break;
				}
			}
			if ((await this.prisma.userBlockedUser.findMany({
				where: {
					OR: [
						{ blockeeId: user.id, blockerId: otherUser.id },
						{ blockeeId: otherUser.id, blockerId: user.id }
					]
				}
			})).length > 0) {
				throw new UnauthorizedException();
			}
		}
		return new ConversationMessage(await this.prisma.message.create({
			data: {
				senderId: user.id,
				channelId: data.channelId,
				content: data.content
			},
			select: {
				sender: true,
				createdAt: true,
				content: true
			}
		}));
	}

	// banUserFromChannel
	async banUserFromChannel(data: UserOnUserActionDto) : Promise<UserBannedFromChannel> {
		const user = await this.userPrisma.findUserByLogin42(data.login42);
		const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
		if (!(await this.chatService.isChannelMember({ userId: user.id, channelId: data.channelId }))
			|| !(await this.chatService.isChannelMember({ userId: otherUser.id, channelId: data.channelId }))) {
			throw new BadRequestException();
		}
		const membership = await this.chatService.getMembership({ userId: user.id, channelId: data.channelId });
		const otherMembership = await this.chatService.getMembership({ userId: otherUser.id, channelId: data.channelId });
		if (membership.role === MemberRole.MEMBER || otherMembership.role === MemberRole.OWNER) {
			throw new UnauthorizedException();
		}
		await this.prisma.memberOfChannel.update({
			where: {
				channelId_userId: {
					userId: otherUser.id,
					channelId: data.channelId
				}
			},
			data: { hasLeft: true }
		});
		return await this.prisma.userBannedFromChannel.create({
			data: {
				userId: otherUser.id,
				channelId: data.channelId
			}
		});
	}

	// muteUserFromChannel
	async muteUserFromChannel(data: UserOnUserActionDto) : Promise<MemberOfChannel> {
		const user = await this.userPrisma.findUserByLogin42(data.login42);
		const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
		if (!(await this.chatService.isChannelMember({ userId: user.id, channelId: data.channelId }))
			|| !(await this.chatService.isChannelMember({ userId: otherUser.id, channelId: data.channelId }))) {
			throw new BadRequestException();
		}
		const membership = await this.chatService.getMembership({ userId: user.id, channelId: data.channelId });
		const otherMembership = await this.chatService.getMembership({ userId: otherUser.id, channelId: data.channelId });
		if (membership.role === MemberRole.MEMBER || otherMembership.role === MemberRole.OWNER) {
			throw new UnauthorizedException();
		}
		return await this.prisma.memberOfChannel.update({
			where: {
				channelId_userId: {
					userId: otherUser.id,
					channelId: data.channelId
				}
			},
			data: { isMuted: true }
		});
	}

	// unmuteUserFromChannel
	async unmuteUserFromChannel(data: UserOnUserActionDto) : Promise<MemberOfChannel> {
		const user = await this.userPrisma.findUserByLogin42(data.login42);
		const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
		if (!(await this.chatService.isChannelMember({ userId: user.id, channelId: data.channelId }))
			|| !(await this.chatService.isChannelMember({ userId: otherUser.id, channelId: data.channelId }))) {
			throw new BadRequestException();
		}
		const membership = await this.chatService.getMembership({ userId: user.id, channelId: data.channelId });
		const otherMembership = await this.chatService.getMembership({ userId: otherUser.id, channelId: data.channelId });
		if (membership.role === MemberRole.MEMBER || otherMembership.role === MemberRole.OWNER) {
			throw new UnauthorizedException();
		}
		return await this.prisma.memberOfChannel.update({
			where: {
				channelId_userId: {
					userId: otherUser.id,
					channelId: data.channelId
				}
			},
			data: { isMuted: false }
		});
	}

	// upgradeUserRole
	async upgradeUserRole(data: UserOnUserActionDto) : Promise<MemberOfChannel> {
		const user = await this.userPrisma.findUserByLogin42(data.login42);
		const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
		if (!(await this.chatService.isChannelMember({ userId: user.id, channelId: data.channelId }))
			|| !(await this.chatService.isChannelMember({ userId: otherUser.id, channelId: data.channelId }))) {
			throw new BadRequestException();
		}
		const membership = await this.chatService.getMembership({ userId: user.id, channelId: data.channelId });
		const otherMembership = await this.chatService.getMembership({ userId: otherUser.id, channelId: data.channelId });
		if (membership.role === MemberRole.MEMBER || otherMembership.role !== MemberRole.MEMBER) {
			throw new UnauthorizedException();
		}
		return await this.prisma.memberOfChannel.update({
			where: {
				channelId_userId: {
					userId: otherUser.id,
					channelId: data.channelId
				}
			},
			data: { role: MemberRole.ADMIN }
		})
	}

	// downgradeUserRole
	async downgradeUserRole(data: UserOnUserActionDto) : Promise<MemberOfChannel> {
		const user = await this.userPrisma.findUserByLogin42(data.login42);
		const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
		if (!(await this.chatService.isChannelMember({ userId: user.id, channelId: data.channelId }))
			|| !(await this.chatService.isChannelMember({ userId: otherUser.id, channelId: data.channelId }))) {
			throw new BadRequestException();
		}
		const membership = await this.chatService.getMembership({ userId: user.id, channelId: data.channelId });
		const otherMembership = await this.chatService.getMembership({ userId: otherUser.id, channelId: data.channelId });
		if (membership.role === MemberRole.MEMBER || otherMembership.role !== MemberRole.ADMIN) {
			throw new UnauthorizedException();
		}
		return await this.prisma.memberOfChannel.update({
			where: {
				channelId_userId: {
					userId: otherUser.id,
					channelId: data.channelId
				}
			},
			data: { role: MemberRole.MEMBER }
		})
	}

	// inviteUserToChannel
	async inviteUserToChannel(data: UserOnUserActionDto) : Promise<MemberOfChannel> {
		const user = await this.userPrisma.findUserByLogin42(data.login42);
		const otherUser = await this.userPrisma.findUserByLogin42(data.otherLogin42);
		if (!(await this.chatService.isChannelMember({ userId: user.id, channelId: data.channelId }))
			|| (await this.chatService.isChannelMember({ userId: otherUser.id, channelId: data.channelId }))) {
			throw new BadRequestException();
		}
		if (await this.chatService.userIsBannedFromChannel({ userId: otherUser.id, channelId: data.channelId })) {
			throw new UnauthorizedException();
		}
		const membership = await this.chatService.getMembership({ userId: user.id, channelId: data.channelId });
		if (membership.role === MemberRole.MEMBER) {
			throw new UnauthorizedException();
		}
		return await this.prisma.memberOfChannel.create({
			data: {
				userId: otherUser.id,
				channelId: data.channelId,
				role: MemberRole.MEMBER,
				isMuted: false
			}
		});
	}

	// joinChannel
	async joinChannel(data: JoinChannelDto) : Promise<MemberOfChannel> {
		const user = await this.userPrisma.findUserByLogin42(data.login42);
		if (await this.chatService.isChannelMember({ userId: user.id, channelId: data.channelId })) {
			throw new BadRequestException();
		}
		if (await this.chatService.userIsBannedFromChannel({ userId: user.id, channelId: data.channelId })) {
			throw new UnauthorizedException();
		}
		const channel = await this.prisma.channel.findUnique({ where: { id: data.channelId } });
		if (channel.isProtected) {
			if (!data.password) {
				throw new BadRequestException();
			}
			if (!(await argon.verify(channel.password, data.password))) {
				throw new UnauthorizedException();
			}
		}
		let newRole: MemberRole = MemberRole.MEMBER;
		if ((await this.prisma.memberOfChannel.findMany({
			where: { channelId: data.channelId }
		})).length === 0) {
			newRole = MemberRole.OWNER;
		}
		if ((await this.prisma.memberOfChannel.findMany({
			where: { userId: user.id, channelId: data.channelId }
		})).length > 0) {
			return await this.prisma.memberOfChannel.update({
				where: {
					channelId_userId: {
						channelId: data.channelId,
						userId: user.id
					}
				},
				data: {
					hasLeft: false,
					role: newRole
				}
			})
		}
		return await this.prisma.memberOfChannel.create({
			data: {
				userId: user.id,
				channelId: data.channelId,
				role: newRole,
				isMuted: false
			}
		});
	}

	// leaveChannel
	async leaveChannel(login42: string, channelId: number) : Promise<MemberOfChannel> {
		const user = await this.userPrisma.findUserByLogin42(login42);
		if (!(await this.chatService.isChannelMember({ userId: user.id, channelId }))) {
			throw new BadRequestException();
		}
		const membership = await this.chatService.getMembership({ userId: user.id, channelId });
		if (membership.role === MemberRole.OWNER) {
			const members = await this.prisma.memberOfChannel.findMany({
				where: {
					channelId,
				}
			});
			let newOwner = null;
			let newOwnerFound = false;
			const admins = members.filter(member => member.role === MemberRole.ADMIN);
			if (admins.length === 0) {
				const restMembers = members.filter(member => member.role === MemberRole.MEMBER);
				if (restMembers.length > 0) {
					newOwner = restMembers[0];
					newOwnerFound = true;
				}
			} else {
				newOwner = admins[0];
				newOwnerFound = true;
			}
			if (newOwnerFound) {
				return await this.prisma.memberOfChannel.update({
					where: {
						channelId_userId: {
							channelId,
							userId: newOwner.userId
						}
					},
					data: {
						role: MemberRole.ADMIN
					}
				});
			}
		}
		return await this.prisma.memberOfChannel.update({
			where: {
				channelId_userId: {
					userId: user.id,
					channelId
				}
			},
			data: {
				role: MemberRole.MEMBER,
				hasLeft: true
			}
		});
	}
}
