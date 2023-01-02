import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Game, User } from "@prisma/client";
import { UpdateUser } from "src/users/dto";

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

    async findAllGames(username: string) : Promise<Game[]> {
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
            }
        });
        return games;
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
}
