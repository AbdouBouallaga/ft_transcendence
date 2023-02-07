import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { UpdateUser } from './dto';
import { GameStats, UserFullProfile, UserProfile } from './interfaces';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMyProfile(@Req() req: any): UserProfile {
    if (!req.user) throw new UnauthorizedException();
    return new UserProfile(req.user);
  }

  @Post('me')
  @UseGuards(JwtAuthGuard)
  async updateMyUsername(
    @Req() req: any,
    @Body() updateUser: UpdateUser,
  ): Promise<UserProfile> {
    if (!req.user) throw new UnauthorizedException();
    const oldUsername = req.user.username;
    return await this.usersService.updateUsername(oldUsername, updateUser);
  }

  @Get('me/friends')
  @UseGuards(JwtAuthGuard)
  async getMyFriends(@Req() req: any): Promise<UserProfile[]> {
    if (!req.user) throw new UnauthorizedException();
    return await this.usersService.getFriends(req.user.username);
  }

  @Get('me/history')
  @UseGuards(JwtAuthGuard)
  async getMyGameHistory(@Req() req: any): Promise<GameStats[]> {
    if (!req.user) throw new UnauthorizedException();
    return await this.usersService.getMatchHistory(req.user.username);
  }

  @Get('me/fullProfile')
  @UseGuards(JwtAuthGuard)
  async getMyFullProfile(@Req() req: any): Promise<UserFullProfile> {
    if (!req.user) throw new UnauthorizedException();
    return await this.usersService.getFullProfile(
      req.user.id,
      req.user.username,
    );
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Param('username') username: string): Promise<UserProfile> {
    return await this.usersService.getProfile(username);
  }

  @Get(':username/friends')
  @UseGuards(JwtAuthGuard)
  async getFriends(
    @Param('username') username: string,
  ): Promise<UserProfile[]> {
    return await this.usersService.getFriends(username);
  }

  @Get(':username/history')
  @UseGuards(JwtAuthGuard)
  async getGameHistory(
    @Param('username') username: string,
  ): Promise<GameStats[]> {
    return await this.usersService.getMatchHistory(username);
  }

  @Get(':username/fullProfile')
  @UseGuards(JwtAuthGuard)
  async getFullProfile(
    @Param('username') username: string,
    @Req() req: any,
  ): Promise<UserFullProfile> {
    if (!req.user) throw new UnauthorizedException();
    return await this.usersService.getFullProfile(req.user.id, username);
  }

  @Get('find/:username')
  @UseGuards(JwtAuthGuard)
  async findUsers(@Param('username') username: string): Promise<UserProfile[]> {
    return await this.usersService.findUsersContains(username);
  }

  @Post('follow/:username')
  @UseGuards(JwtAuthGuard)
  async followUser(
    @Param('username') username: string,
    @Req() req: any,
  ): Promise<any> {
    if (!req.user) throw new UnauthorizedException();
    return await this.usersService.followUser(req.user.login42, username);
  }

  @Post('unfollow/:username')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @Param('username') username: string,
    @Req() req: any,
  ): Promise<any> {
    if (!req.user) throw new UnauthorizedException();
    return await this.usersService.unfollowUser(req.user.login42, username);
  }

  @Post('block/:username')
  @UseGuards(JwtAuthGuard)
  async blockUser(
    @Param('username') username: string,
    @Req() req: any,
  ): Promise<any> {
    if (!req.user) throw new UnauthorizedException();
    return await this.usersService.blockUser(req.user.login42, username);
  }

  @Post('unblock/:username')
  @UseGuards(JwtAuthGuard)
  async unblockUser(
    @Param('username') username: string,
    @Req() req: any,
  ): Promise<any> {
    if (!req.user) throw new UnauthorizedException();
    return await this.usersService.unblockUser(req.user.login42, username);
  }
}
