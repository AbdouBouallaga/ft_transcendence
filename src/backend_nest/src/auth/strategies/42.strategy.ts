import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";
import { AuthService } from "../auth.service";

@Injectable()
export class FortyTwoStrategy extends PassportStrategy(Strategy, '42') {
    constructor(private readonly authService: AuthService, readonly config: ConfigService) {
        super({
            clientID: config.get('FORTYTWO_APP_ID'),
            clientSecret: config.get('FORTYTWO_APP_SECRET'),
            callbackURL: "http://localhost:5000/auth/42/callback"
        });
    }

    async validate(accessToken: string, refreshToken: string, profile: any) : Promise<any> {
        const login42 = profile.username;
        const user = await this.authService.validateUserByLogin42(login42);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
