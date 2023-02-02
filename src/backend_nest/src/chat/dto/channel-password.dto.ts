import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class ChannelPasswordDto {
	@IsNotEmpty()
	@IsString()
	login42: string;

	@IsNotEmpty()
	channelId: number;

	@IsNotEmpty()
	isProtected: boolean;

	@IsOptional()
	@IsString()
	password: string;
}
