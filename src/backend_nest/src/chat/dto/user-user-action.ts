import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UserOnUserActionDto {
    @IsNotEmpty()
    @IsString()
    login42: string;

    @IsNotEmpty()
    @IsString()
    otherLogin42: string;

    @IsNotEmpty()
    @IsNumber()
    channelId: number;
}
