import { Injectable } from '@nestjs/common';
import { Game, User } from '@prisma/client';
import { UserPrismaService } from 'src/prisma/user.service';
import { UpdateUser } from './dto';
import { GameStats, UserFullProfile, UserProfile, UserFullGameStats } from './interfaces';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly userPrisma: UserPrismaService,
                private readonly prisma: PrismaService) {}

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

    async getFullProfile(userId: number, username: string) : Promise<UserFullProfile> {
        const otherUserId = (await this.userPrisma.findUser(username)).id;
        const profile: UserProfile = await this.getProfile(username);
        const blocked = (await this.prisma.userBlockedUser.findMany({
            where: {
                blockeeId: userId,
                blockerId: otherUserId
            }
        })).length > 0;
        const blocking = (await this.prisma.userBlockedUser.findMany({
            where: {
                blockerId: userId,
                blockeeId: otherUserId
            }
        })).length > 0;
        if (blocked) {
            return {
                ...profile,
                blocked,
                blocking,
                friends: [],
                games: [],
            };
        }
        const userFullProfile: UserFullProfile = {
            ...profile,
            blocked,
            blocking,
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

    async followUser(login42: string, username: string) {
        return await this.userPrisma.followUser(login42, username); 
    }

    async unfollowUser(login42: string, username: string) {
        return await this.userPrisma.unfollowUser(login42, username); 
    }

    async blockUser(login42: string, username: string) {
        return await this.userPrisma.blockUser(login42, username);
    }

    async unblockUser(login42: string, username: string) {
        return await this.userPrisma.unblockUser(login42, username);
    }
}
