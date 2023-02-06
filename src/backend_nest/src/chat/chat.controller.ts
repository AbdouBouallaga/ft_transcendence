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
import { CreateChannelDto, CreateDmDto } from './dto';
import { Channel } from '@prisma/client';
import { ChannelInfo, Conversation } from './interfaces';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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
    const channels = await this.chatService.getPublicChannels(req.user.id);
    console.log('channels', channels);
    return channels;
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
}
