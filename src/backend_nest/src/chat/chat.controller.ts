import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { CreateChannelDto, CreateDmDto, UserJoinChannelDto } from './dto';
import { Channel } from '@prisma/client';
import { ChannelInfo } from './interfaces';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('createRoom')
  @UseGuards(JwtAuthGuard)
  async createRoom(@Body() data: CreateChannelDto): Promise<Channel> {
    console.log(data);
    return await this.chatService.createRoom(data);
  }

  @Post('createDM')
  @UseGuards(JwtAuthGuard)
  async createDirectMessage(@Body() data: CreateDmDto): Promise<Channel> {
    return await this.chatService.createDirectMessage(data);
  }

  @Post('joinRoom')
  @UseGuards(JwtAuthGuard)
  async joinRoom(
    @Body() data: UserJoinChannelDto,
  ): Promise<{ success: boolean }> {
    await this.chatService.userJoinChannel(data);
    return {
      success: true,
    };
  }

  @Get('publicChannels')
  @UseGuards(JwtAuthGuard)
  async getPublicChannels(): Promise<Channel[]> {
    return await this.chatService.getPublicChannels();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyChannels(@Req() req: any): Promise<ChannelInfo[]> {
    const channels = await this.chatService.getMyChannels(req.user.id);
    return channels.map((channel) => {
      return new ChannelInfo(channel);
    });
  }
}
