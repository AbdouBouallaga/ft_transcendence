import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserPrismaService } from "src/prisma/user.service";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(private readonly userPrisma: UserPrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([(request: Request) => {
                let data = request?.cookies.access_token;
                if(!data){
                    return null;
                }
                return data;
            }]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET
        });
    }

    async validate(payload: any) : Promise<any> {
        const user = await this.userPrisma.findUser(payload.login42);
        if (!user || user.id !== payload.sub) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
