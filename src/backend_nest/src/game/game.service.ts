import { Injectable } from '@nestjs/common';
import { Game } from '@prisma/client';
import { NONAME } from 'dns';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserPrismaService } from 'src/prisma/user.service';

@Injectable()
export class GameService {
	constructor(private readonly prisma: PrismaService,
				private readonly userPrisma: UserPrismaService) {}

	async recordGameResults(data: { login42_1: string, login42_2: string, score1: number, score2: number }) : Promise<Game> {
		const user1 = await this.userPrisma.findUserByLogin42(data.login42_1);
		const user2 = await this.userPrisma.findUserByLogin42(data.login42_2);
		return this.prisma.game.create({
			data: {
				idPlayer1: user1.id,
				idPlayer2: user2.id,
				scorePlayer1: data.score1,
				scorePlayer2: data.score2
			}
		});
		return null;
	}
}
