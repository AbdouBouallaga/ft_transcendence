import { Controller, Get, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard } from './guards';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('42')
    @UseGuards(FortyTwoAuthGuard)
    async auth42(@Req() req: any) {}

    @Get('42/callback')
    @UseGuards(FortyTwoAuthGuard)
    async callback42(@Req() req: any, @Res({ passthrough: true }) res: Response) { // : Promise<{ login42: string }> {
        if (!req.user)
            throw new UnauthorizedException();
        else if (!req.user.tfaEnabled) {
            const { access_token, login42 } = this.authService.login42(req);
            res.cookie('access_token', access_token);
            if (req.user.isNewUser) {
                res.redirect(process.env.WELCOME_URL);
            } else {
                res.redirect(process.env.HOME_URL);
            }
        }
        else {
            res.cookie('key', req.user.login42);
            res.redirect(process.env.VERIFY_2FA_URL);
        }
    }

    @Get('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) : Promise<void> {
        res.clearCookie('access_token');
        res.redirect(process.env.HOME_URL);
        res.end();
    }
}
