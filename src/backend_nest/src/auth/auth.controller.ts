import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FortyTwoAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('42')
    @UseGuards(FortyTwoAuthGuard)
    async auth42(@Request() req: any) {}

    @Get('42/callback')
    @UseGuards(FortyTwoAuthGuard)
    async callback42(@Request() req: any) : Promise<{ access_token: string }> {
        return this.authService.login42(req);
    }
}
