import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards';

@Controller('users')
export class UsersController {

    @Get('me')
    @UseGuards(JwtAuthGuard)
    profile(@Request() req) {
        const user = req.user;
        delete user.mfaKey;
        return { user };
    }
}
