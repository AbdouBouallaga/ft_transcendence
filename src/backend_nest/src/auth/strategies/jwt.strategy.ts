import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersPrismaService } from "src/prisma/users-prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly usersPrisma: UsersPrismaService, readonly config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.get('JWT_SECRET')
        });
    }

    async validate(payload: any) : Promise<any> {
        const user = await this.usersPrisma.findUserByLogin42(payload.login42);
        if (!user || user.id !== payload.sub) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
