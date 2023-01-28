import { ChannelType } from '@prisma/client';
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateChannelDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    type: ChannelType;

    @IsBoolean()
    isProtected: boolean;

    @IsOptional()
    password: string;

    @IsNotEmpty()
    login42: string;
}
