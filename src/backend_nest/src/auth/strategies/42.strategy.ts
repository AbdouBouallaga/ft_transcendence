import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";
import { AuthService } from "../auth.service";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
    constructor(private readonly authService: AuthService) {
        super({
            clientID: process.env.FORTYTWO_APP_ID,
            clientSecret: process.env.FORTYTWO_APP_SECRET,
            callbackURL: 'http://127.0.0.1.nip.io/api/auth/42/callback'
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) {
        const login42 = profile.username;
        const user = await this.authService.validateUser({ login42 });
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
