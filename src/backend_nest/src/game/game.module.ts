import { Module } from "@nestjs/common";
import { GameGateway } from "./game.gateway";
import { GameService } from './game.service';
import { UserPrismaService } from "src/prisma/user.service";
import { UsersModule } from "src/users/users.module";
import { PrismaService } from "src/prisma/prisma.service";

@Module({
    imports: [UsersModule],
    providers: [GameGateway, GameService, UserPrismaService, PrismaService]
})
export class GameModule {}
