import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { User } from "@prisma/client";

@Injectable()
export class UserPrismaService {
    constructor(private readonly prisma: PrismaService) {}

    async findOrCreateUser(data: { login42: string }) : Promise<User> {
        const user = await this.findUser(data);
        if (!user) {
            const newUser = await this.createUser(data);
            if (!newUser) {
                throw new InternalServerErrorException();
            }
            return newUser;
        }
        return user;
    }

    async findUser(where: { login42: string }) : Promise<User> {
        return await this.prisma.user.findUnique({
            where,
        });
    }

    async createUser(data: { login42: string }) : Promise<User> {
        return await this.prisma.user.create({
            data,
        });
    }
}
