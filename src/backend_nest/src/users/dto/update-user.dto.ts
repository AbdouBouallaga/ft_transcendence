import { IsNotEmpty, IsString } from "class-validator";

export class UpdateUser {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsString()
    @IsNotEmpty()
    avatar: string;
};
