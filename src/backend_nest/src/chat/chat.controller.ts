import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guards';
import {
  CreateChannelDto,
  CreateDmDto,
  JoinChannelDto,
  UserOnUserActionDto,
} from './dto';
import { Channel } from '@prisma/client';
import { ChannelInfo, Conversation, ConversationUser } from './interfaces';
import { ChatServerService } from './chat-server.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatServerService: ChatServerService,
  ) {}

  @Post('createRoom')
  @UseGuards(JwtAuthGuard)
  async createRoom(
    @Body() data: CreateChannelDto,
    @Req() req: any,
  ): Promise<Channel> {
    return await this.chatService.createRoom(data, req.user.id);
  }

  @Post('updateRoom')
  @UseGuards(JwtAuthGuard)
  async updateRoom(
    @Body() data: CreateChannelDto,
    @Req() req: any,
  ): Promise<Channel> {
    return await this.chatService.updateRoom(data, req.user.id);
  }

  @Post('createDM')
  @UseGuards(JwtAuthGuard)
  async createDirectMessage(
    @Body() data: CreateDmDto,
    @Req() req: any,
  ): Promise<Channel> {
    return await this.chatService.createDirectMessage(data, req.user.id);
  }

  @Get('publicChannels')
  @UseGuards(JwtAuthGuard)
  async getPublicChannels(@Req() req: any): Promise<ChannelInfo[]> {
    return await this.chatService.getPublicChannels(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyChannels(@Req() req: any): Promise<ChannelInfo[]> {
    return await this.chatService.getMyChannels(req.user.id);
  }

  @Get(':channelId')
  @UseGuards(JwtAuthGuard)
  async getConversation(
    @Req() req: any,
    @Param('channelId', new ParseIntPipe()) channelId: number,
  ): Promise<Conversation> {
    return await this.chatService.getFullChannelInfo(
      channelId,
      req.user.id,
      req.user.login42,
    );
  }

  @Get(':channelId/members')
  @UseGuards(JwtAuthGuard)
  async getChannelMembers(
    @Req() req: any,
    @Param('channelId', new ParseIntPipe()) channelId: number,
  ): Promise<ConversationUser[]> {
    return await this.chatService.getChannelMembers(req.user.id, channelId);
  }

  @Post('joinChannel')
  @UseGuards(JwtAuthGuard)
  async joinChannel(
    @Req() req: any,
    @Body() data: JoinChannelDto,
  ): Promise<{ success: boolean }> {
    try {
      await this.chatServerService.joinChannel(data, req.user.login42);
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  @Post('leaveChannel')
  @UseGuards(JwtAuthGuard)
  async leaveChannel(
    @Req() req: any,
    @Body() data: { channelId: number },
  ): Promise<{ success: boolean }> {
    try {
      await this.chatServerService.leaveChannel(
        req.user.login42,
        data.channelId,
      );
      return { success: true };
    } catch (e) {
      return { success: false };
    }
  }

  @Post('inviteUserToChannel')
  @UseGuards(JwtAuthGuard)
  async inviteUserToChannel(
    @Req() req: any,
    @Body() data: UserOnUserActionDto,
  ): Promise<{ success: boolean }> {
    try {
      await this.chatServerService.inviteUserToChannel(data, req.user.login42);
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  @Post('banUserFromChannel')
  @UseGuards(JwtAuthGuard)
  async banUserFromChannel(
    @Req() req: any,
    @Body() data: UserOnUserActionDto,
  ): Promise<{ success: boolean }> {
    try {
      await this.chatServerService.banUserFromChannel(data, req.user.login42);
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  @Post('muteUserFromChannel')
  @UseGuards(JwtAuthGuard)
  async muteUserFromChannel(
    @Req() req: any,
    @Body() data: UserOnUserActionDto,
  ): Promise<{ success: boolean }> {
    try {
      await this.chatServerService.muteUserFromChannel(data, req.user.login42);
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  @Post('unmuteUserFromChannel')
  @UseGuards(JwtAuthGuard)
  async unmuteUserFromChannel(
    @Req() req: any,
    @Body() data: UserOnUserActionDto,
  ): Promise<{ success: boolean }> {
    try {
      await this.chatServerService.unmuteUserFromChannel(
        data,
        req.user.login42,
      );
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  @Post('upgradeUserRole')
  @UseGuards(JwtAuthGuard)
  async upgradeUserRole(
    @Req() req: any,
    @Body() data: UserOnUserActionDto,
  ): Promise<{ success: boolean }> {
    try {
      await this.chatServerService.upgradeUserRole(data, req.user.login42);
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  @Post('downgradeUserRole')
  @UseGuards(JwtAuthGuard)
  async downgradeUserRole(
    @Req() req: any,
    @Body() data: UserOnUserActionDto,
  ): Promise<{ success: boolean }> {
    try {
      await this.chatServerService.downgradeUserRole(data, req.user.login42);
      return { success: true };
    } catch {
      return { success: false };
    }
  }
}
