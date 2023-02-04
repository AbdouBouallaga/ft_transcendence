import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class BanUserDto {
	@IsNotEmpty()
	@IsNumber()
	channelId: number;

	@IsNotEmpty()
	@IsString()
	login42: string;

	@IsNotEmpty()
	@IsString()
	otherLogin42: string;
}

export class MuteUserDto {
	@IsNotEmpty()
	@IsNumber()
	channelId: number;

	@IsNotEmpty()
	@IsString()
	login42: string;

	@IsNotEmpty()
	@IsString()
	otherLogin42: string;

	@IsNotEmpty()
	@IsNumber()
	duration: number;
}