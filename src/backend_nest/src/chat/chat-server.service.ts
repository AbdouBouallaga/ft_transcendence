import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatServerService {
	constructor(private readonly prisma: PrismaService) {}

	// sendMessage
	// banUserFromChannel
	// muteUserFromChannel
	// upgradeUserRole
	// downgradeUserRole
	// inviteUserToChannel
	// joinChannel
}
