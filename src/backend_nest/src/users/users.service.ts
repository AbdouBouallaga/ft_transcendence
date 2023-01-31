import { Injectable } from '@nestjs/common';
import { Game, User } from '@prisma/client';
import { UserPrismaService } from 'src/prisma/user.service';
import { UpdateUser } from './dto';
import { GameStats, UserFullProfile, UserProfile, UserFullGameStats } from './interfaces';

@Injectable()
export class UsersService {
    constructor(private readonly userPrisma: UserPrismaService) {}

    async getProfile(username: string) : Promise<UserProfile> {
        return new UserProfile(await this.userPrisma.findUser(username));
    }

    async getFriends(username: string) : Promise<UserProfile[]> {
        const friends = await this.userPrisma.findAllFriends(username);
        return friends.map(
            (friend) => {
                return new UserProfile(friend);
            }
        );
    }

    async getMatchHistory(username: string) : Promise<GameStats[]> {
        return await this.userPrisma.findAllGames(username);
    }

    // getUserGameStatsAndAchievements(gameHistory: GameStats[]) : UserFullGameStats {

    // }

    async getFullProfile(username: string) : Promise<UserFullProfile> {
        const profile: UserProfile = await this.getProfile(username);
        const userFullProfile: UserFullProfile = {
            ...profile,
            friends: await this.getFriends(username),
            games: await this.getMatchHistory(username),
        }
        return userFullProfile;
    }

    async findUsersContains(username: string) : Promise<UserProfile[]> {
        const users = await this.userPrisma.findUsersContains(username);
        return users.map(
            (user) => {
                return new UserProfile(user);
            }
        );
    }

    async updateUsername(oldUsername: string, updateUser: UpdateUser) : Promise<UserProfile> {
        return new UserProfile(await this.userPrisma.updateUsername(oldUsername, updateUser));
    }

    async followUser(login42: string, otherLogin42: string) {
        return await this.userPrisma.followUser(login42, otherLogin42); 
    }
}
