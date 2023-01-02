import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { join } from 'path';
import { WebsocketsModule } from './websockets/websockets.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ChatsModule } from './chats/chats.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    WebsocketsModule,
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'static'),
    // }),
    ConfigModule.forRoot({
      isGlobal: true
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ChatsModule,
    SocketModule
  ]
})
export class AppModule {}
