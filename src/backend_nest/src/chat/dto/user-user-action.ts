import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UserOnUserActionDto {
    @IsNotEmpty()
    @IsString()
    otherLogin42: string;

    @IsNotEmpty()
    @IsNumber()
    channelId: number;
}
