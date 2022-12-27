import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoStrategy, JwtStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule.register({
    secret: process.env.JWT_SECRET,
    signOptions: {
      expiresIn: '60s'
    }
  })],
  controllers: [AuthController],
  providers: [AuthService, FortyTwoStrategy, JwtStrategy]
})
export class AuthModule {}
