import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { UserPrismaService } from 'src/prisma/user.service';

@Injectable()
export class AuthService {
    constructor(private readonly userPrisma: UserPrismaService,
                private readonly jwtService: JwtService) {}

    async validateUser(login42: string, avatar: string) : Promise<User> {
        return await this.userPrisma.findOrCreateUser(login42, avatar);
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
