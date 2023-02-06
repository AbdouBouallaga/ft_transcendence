import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class JoinChannelDto {
    @IsNotEmpty()
    @IsNumber()
    channelId: number;

    @IsOptional()
    @IsString()
    password: string;
}
