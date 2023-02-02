import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UserJoinChannelDto {
	@IsNotEmpty()
	@IsString()
	login42: string;

	@IsNotEmpty()
	channelId: number;

    @IsOptional()
	@IsString()
    password: string;
}

export class InviteUserToChannelDto {
	@IsNotEmpty()
	@IsString()
	login42: string;

	@IsNotEmpty()
	@IsString()
	otherLogin42: string;

	@IsNotEmpty()
	channelId: number;
}
