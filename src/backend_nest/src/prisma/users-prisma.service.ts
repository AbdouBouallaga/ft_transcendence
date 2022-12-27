import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from './prisma.service';

@Injectable()
export class UsersPrismaService {
    constructor(private readonly prisma: PrismaService) {}

    async findOrCreateUserByLogin42(login42: string) : Promise<User> {
        const user = await this.findUserByLogin42(login42);
        if (!user) {
            const newUser = await this.createUser(login42);
            if (!newUser) {
                throw new InternalServerErrorException();
            }
            return newUser;
        }
        return user;
    }

    async findUserByLogin42(login42: string) : Promise<User> {
        return await this.prisma.user.findUnique({
            where: {
                login42
            }
        });
    }

    async createUser(login42: string) : Promise<User> {
        const data = {
            login42
        };
        return await this.prisma.user.create({
            data,
        });
    }
}
