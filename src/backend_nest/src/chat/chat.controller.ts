import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guards';
import { CreateChannelDto, CreateDmDto, UserJoinChannelDto } from './dto';
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
    try {
      return await this.chatService.createRoom(data, req.user.login42);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Post('updateRoom')
  @UseGuards(JwtAuthGuard)
  async updateRoom(@Body() data: CreateChannelDto) : Promise<Channel> {
    try {
      return await this.chatService.updateRoom(data);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Post('createDM')
  @UseGuards(JwtAuthGuard)
  async createDirectMessage(@Body() data: CreateDmDto): Promise<Channel> {
    try {
      return await this.chatService.createDirectMessage(data);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Post('joinRoom')
  @UseGuards(JwtAuthGuard)
  async joinRoom(
    @Body() data: UserJoinChannelDto,
  ): Promise<{ success: boolean }> {
    try {
      await this.chatService.userJoinChannel(data);
      return {
        success: true,
      };
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('publicChannels')
  @UseGuards(JwtAuthGuard)
  async getPublicChannels(@Req() req: any): Promise<ChannelInfo[]> {
    try {
      return await this.chatService.getPublicChannels(req.user.id);
    } catch (e) {
      throw new BadRequestException();
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMyChannels(@Req() req: any): Promise<ChannelInfo[]> {
    try {
      const channels = await this.chatService.getMyChannels(req.user.id);
      return channels.map((channel) => {
        return new ChannelInfo(channel);
      });
    } catch (e) {
      throw new BadRequestException();
    }
  }

	@Get(':channelId')
	@UseGuards(JwtAuthGuard)
	async getConversation(@Req() req: any, @Param('channelId', new ParseIntPipe()) channelId: number) : Promise<Conversation> {
    try {
      return await this.chatService.getFullChannelInfo(channelId, req.user.id);
    } catch (e) {
      throw new BadRequestException();
    }
	}
}
