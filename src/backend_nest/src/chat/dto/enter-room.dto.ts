import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class EnterRoomDto {
	@IsString()
	@IsNotEmpty()
	login42: string;

	@IsNumber()
	@IsNotEmpty()
	channelId: number;
}
