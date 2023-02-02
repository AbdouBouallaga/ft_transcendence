import { ChannelType } from '@prisma/client';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

export class CreateDmDto {
    @IsNotEmpty()
	@IsString()
	login42: string;

    @IsNotEmpty()
	@IsString()
	otherLogin42: string;
}
