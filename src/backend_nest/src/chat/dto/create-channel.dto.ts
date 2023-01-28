import { ChannelType } from '@prisma/client';
import { isBoolean, isNotEmpty, IsNotEmpty } from 'class-validator';

export class CreateChannelDto {
    @IsNotEmpty()
    name: string;

    type: ChannelType;

    @isBoolean()
    isProtected: boolean;

    password: string;

    @isNotEmpty()
    login42: string;
}
