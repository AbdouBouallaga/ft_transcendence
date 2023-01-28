import { Injectable } from '@nestjs/common';
import { ChannelType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChannelDto } from './dto';

@Injectable()
export class ChatService {
    constructor(private readonly prisma: PrismaService) { }

    async createChannel(data: CreateChannelDto): Promise<Channel> {

    }

}
