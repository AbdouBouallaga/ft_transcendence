import { Injectable } from '@nestjs/common';
import { Game, User } from '@prisma/client';
import { UserPrismaService } from 'src/prisma/user.service';

@Injectable()
export class UsersService {
    constructor(private readonly userPrisma: UserPrismaService) {}

    async getProfile(username: string) : Promise<User> {
        return await this.userPrisma.findUser(username);
    }

    async getFriends(username: string) : Promise<User[]> {
        return await this.userPrisma.findAllFriends(username);
    }

    async getMatchHistory(username: string) : Promise<Game[]> {
        return await this.userPrisma.findAllGames(username);
    }
}
