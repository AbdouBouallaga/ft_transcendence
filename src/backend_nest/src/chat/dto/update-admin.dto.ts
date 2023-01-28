import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateAdminDto {
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
