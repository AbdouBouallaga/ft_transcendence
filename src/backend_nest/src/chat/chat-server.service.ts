import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Message } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendMessageDto } from './dto';
import { UserPrismaService } from 'src/prisma/user.service';
import { ChatService } from './chat.service';

@Injectable()
export class ChatServerService {
	constructor(private readonly prisma: PrismaService,
				private readonly userPrisma: UserPrismaService,
				private readonly chatService: ChatService) {}

	// sendMessage
	async sendMessage(data: SendMessageDto) : Promise<Message> {
		const user = await this.userPrisma.findUserByLogin42(data.login42);
		if (!(await this.chatService.isChannelMember({ userId: user.id, channelId: data.channelId }))) {
			throw new BadRequestException();
		}
		const membership = await this.chatService.getMembership({ userId: user.id, channelId: data.channelId });
		if (membership.isMuted
			|| (await this.chatService.userIsBannedFromChannel({ userId: user.id, channelId: data.channelId }))) {
			throw new UnauthorizedException();
		}
		return await this.prisma.message.create({
			data: {
				senderId: user.id,
				channelId: data.channelId,
				content: data.content
			}
		});
	}

	// banUserFromChannel
	// muteUserFromChannel
	// upgradeUserRole
	// downgradeUserRole
	// inviteUserToChannel
	// joinChannel
}
