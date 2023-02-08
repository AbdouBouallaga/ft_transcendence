import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EnterRoomDto {
  @IsNotEmpty()
  @IsString()
  login42: string;

  @IsNotEmpty()
  @IsNumber()
  channelId: number;
}
