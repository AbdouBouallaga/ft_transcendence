import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Game, User, Follows } from "@prisma/client";
import { UpdateUser } from "src/users/dto";
import { GameStats, UserFullGameStats, UserProfile } from "src/users/interfaces";

@Injectable()
export class UserPrismaService {
    constructor(private readonly prisma: PrismaService) {}

    async findOrCreateUser(login42: string, avatar: string, username?: string) : Promise<User> {
        if (!username) {
            username = login42;
        }

        const user = await this.findUserByLogin42(login42);
        if (!user) {
            const newUser = await this.createUser(login42, avatar);
            if (!newUser) {
                throw new InternalServerErrorException();
            }
            return newUser;
        }
        return user;
    }

    async findUser(username: string) : Promise<User> {
        return await this.prisma.user.findUnique({
            where: {
                username,
            }
        });
    }

    async findUserByLogin42(login42: string) : Promise<User> {
        return await this.prisma.user.findUnique({
            where: {
                login42,
            }
        });
    }

    async createUser(login42: string, avatar: string) : Promise<User> {
        return await this.prisma.user.create({
            data: {
                login42,
                username: login42,
                avatar,
            },
        });
    }

    async findAllFriends(username: string) : Promise<User[]> {
        const friends = await this.prisma.follows.findMany({
            where: {
                follower: {
                    is: {
                        username,
                    }
                }
            },
            select: {
                following: true,
            }
        }).then(friends => {
            return friends.map(friend => friend.following);
        });
        return friends;
    }

    async findAllGames(username: string) : Promise<GameStats[]> {
        const games = await this.prisma.game.findMany({
            where: {
                OR: [
                    {
                        player1: {
                            is: {
                                username,
                            }
                        }
                    },
                    {
                        player2: {
                            is: {
                                username,
                            }
                        }
                    }
                ]
            },
            include: {
                player1: true,
                player2: true,
            }
        });
        let getGameWithFullStats = function (game: any, index: number) : GameStats {
            let winner: UserProfile = new UserProfile(game.player1);
            let winnerScore: number = game.scorePlayer1;
            let loser: UserProfile = new UserProfile(game.player2);
            let loserScore: number = game.scorePlayer2;
            if (winnerScore < loserScore) {
                [winner, loser] = [loser, winner];
                [winnerScore, loserScore] = [loserScore, winnerScore];
            }
            let won: boolean = true;
            if (loser.username === username) {
                won = false;
            }
            return {
                winner,
                winnerScore,
                loser,
                loserScore,
                won,
            };
        };
        return games.map(getGameWithFullStats);
    }

    async findUsersContains(username: string) : Promise<User[]> {
        return await this.prisma.user.findMany({
            where: {
                username: {
                    contains: username,
                }
            }
        });
    }

    async updateUsername(oldUsername: string, updateUser: UpdateUser) : Promise<User> {
        return await this.prisma.user.update({
            where: {
                username: oldUsername,
            },
            data: {
                ...updateUser,
            }
        });
    }

    async setTwoFactorAuthSecret(login42: string, tfaSecret: string) : Promise<User> {
        return await this.prisma.user.update({
            where: {
                login42,
            },
            data: {
                tfaSecret,
            }
        });
    }

    async setTwoFactorAuthEnabled(login42: string, tfaEnabled: boolean) : Promise<User> {
        return await this.prisma.user.update({
            where: {
                login42,
            },
            data: {
                tfaEnabled,
            }
        });
    }

    async followUser(login42: string, otherUsername: string) : Promise<Follows> {
        // TODO: check if user wasn't blocked
        const user = await this.findUserByLogin42(login42);
        const otherUser = await this.prisma.user.findUnique({
            where: {
                username: otherUsername
            }
        });
        return await this.prisma.follows.create({
            data: {
                followerId: user.id,
                followingId: otherUser.id
            }
        });
    }

    async unfollowUser(login42: string, otherUsername: string) : Promise<any> {
        const user = await this.findUserByLogin42(login42);
        const otherUser = await this.prisma.user.findUnique({
            where: {
                username: otherUsername
            }
        });
        return await this.prisma.follows.delete({
            where: {
                followerId_followingId: {
                    followerId: user.id,
                    followingId: otherUser.id
                }
            }
        });
    }
}
