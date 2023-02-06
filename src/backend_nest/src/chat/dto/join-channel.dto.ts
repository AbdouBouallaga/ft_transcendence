import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class JoinChannelDto {
    @IsNotEmpty()
    @IsString()
    login42: string;

    @IsNotEmpty()
    @IsNumber()
    channelId: number;

    @IsOptional()
    @IsString()
    password: string;
}
