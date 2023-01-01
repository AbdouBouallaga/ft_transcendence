import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { Game, User } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getMyProfile(@Req() req: any) : User {
        return req.user;
    }

    @Get('me/friends')
    @UseGuards(JwtAuthGuard)
    async findMyFriends(@Req() req: any) : Promise<User[]> {
        return await this.usersService.getFriends(req.user.username);
    }

    @Get('me/history')
    @UseGuards(JwtAuthGuard)
    async getMyGameHistory(@Req() req: any) : Promise<Game[]> {
        return await this.usersService.getMatchHistory(req.user.username);
    }

    @Get('me/fullProfile')
    @UseGuards(JwtAuthGuard)
    async getMyFullProfile(@Req() req: any) : Promise<any> {
        return await this.usersService.getFullProfile(req.user.username);
    }

    @Get(':username')
    @UseGuards(JwtAuthGuard)
    async getProfile(@Param('username') username: string) : Promise<User> {
        return await this.usersService.getProfile(username);
    }

    @Get(':username/friends')
    @UseGuards(JwtAuthGuard)
    async findFriends(@Param('username') username: string) : Promise<User[]> {
        return await this.usersService.getFriends(username);
    }

    @Get(':username/history')
    @UseGuards(JwtAuthGuard)
    async getGameHistory(@Param('username') username: string) : Promise<Game[]> {
        return await this.usersService.getMatchHistory(username);
    }

    @Get(':username/fullProfile')
    @UseGuards(JwtAuthGuard)
    async getFullProfile(@Param('username') username: string) : Promise<any> {
        return await this.usersService.getFullProfile(username);
    }
}
