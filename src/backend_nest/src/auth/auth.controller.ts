import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
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
    async callback42(@Req() req: any, @Res({ passthrough: true }) res: Response) : Promise<void> {
        const { access_token } = this.authService.login42(req);

        res.cookie('access_token', access_token);
        res.redirect('http://127.0.0.1.nip.io');
    }

    @Get('logout')
    @UseGuards(JwtAuthGuard)
    async logout(@Req() req: any, @Res({ passthrough: true }) res: Response) : Promise<void> {
        res.clearCookie('access_token');
        res.redirect('http://127.0.0.1.nip.io');
        res.end();
    }
}
