import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UsersPrismaService } from 'src/prisma/users-prisma.service';

@Injectable()
export class AuthService {
    constructor(private readonly usersPrisma: UsersPrismaService,
                private readonly jwtService: JwtService) {}

    async validateUserByLogin42(login42: string): Promise<User> {
        return await this.usersPrisma.findOrCreateUserByLogin42(login42);
    }

    login42(req: any) : { access_token: string } {
        if (!req.user) {
            throw new UnauthorizedException();
        }
        const user: User = req.user;
        const payload = {
            sub: user.id,
            login42: user.login42
        };
        return {
            access_token: this.jwtService.sign(payload)
        };
    }
}
