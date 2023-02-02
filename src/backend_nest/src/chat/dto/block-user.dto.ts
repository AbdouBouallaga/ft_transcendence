import { IsNotEmpty, IsString } from "class-validator";

export class BlockUserDto {
	@IsString()
	@IsNotEmpty()
    blockerLogin42: string;

	@IsString()
	@IsNotEmpty()
	blockeeLogin42: string;
}
