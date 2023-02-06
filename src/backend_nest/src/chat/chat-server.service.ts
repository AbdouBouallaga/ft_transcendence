import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ChannelType, Message } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendMessageDto } from './dto';
import { UserPrismaService } from 'src/prisma/user.service';
import { ChatService } from './chat.service';
import { ConversationMessage } from './interfaces';

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
	// muteUserFromChannel
	// upgradeUserRole
	// downgradeUserRole
	// inviteUserToChannel
	// joinChannel
}
