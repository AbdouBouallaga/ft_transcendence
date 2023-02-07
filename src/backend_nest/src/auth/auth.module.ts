import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoStrategy, JwtStrategy } from './strategies';
import { JwtModule } from '@nestjs/jwt';
import { TwoFactorAuthController } from './tfa.controller';
import { TwoFactorAuthService } from './tfa.service';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [AuthController, TwoFactorAuthController],
  providers: [AuthService, FortyTwoStrategy, JwtStrategy, TwoFactorAuthService],
  exports: [AuthService],
})
export class AuthModule {}
