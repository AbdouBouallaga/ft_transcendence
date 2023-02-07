import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TwoFactorAuthService } from './tfa.service';
import { JwtAuthGuard } from './guards';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';

@Controller('auth/tfa')
export class TwoFactorAuthController {
  constructor(
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('generate')
  @UseGuards(JwtAuthGuard)
  async enableTwoFactorAuth(@Req() req: any): Promise<{ otpAuthURL: string }> {
    const login42 = req.user.login42;
    return await this.twoFactorAuthService.generateTwoFactorAuthSecret(login42);
  }

  @Post('disable')
  @UseGuards(JwtAuthGuard)
  async disableTwoFactorAuth(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Body('tfaCode') tfaCode: string,
  ): Promise<{ success: boolean }> {
    const login42 = req.user.login42;
    await this.twoFactorAuthService.setTwoFactorAuthEnabled(login42, false);
    const access_token = this.jwtService.sign({
      sub: req.user.id,
      login42: req.user.login42,
    });
    res.cookie('access_token', access_token);
    return {
      success: true,
    };
  }

  @Post('enable')
  @UseGuards(JwtAuthGuard)
  async confirmTwoFactorAuthEnabling(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Body('tfaCode') tfaCode: string,
  ): Promise<{ success: boolean }> {
    const login42 = req.user.login42;
    const { access_token } =
      await this.twoFactorAuthService.verifyTwoFactorAuthCode(login42, tfaCode);
    await this.twoFactorAuthService.setTwoFactorAuthEnabled(login42, true);
    res.cookie('access_token', access_token);
    return {
      success: true,
    };
  }

  @Post('verify')
  async verifyTwoFactorAuthEnabling(
    @Req() req: any,
    @Res({ passthrough: true }) res: Response,
    @Body('tfaCode') tfaCode: string,
  ) {
    const login42 = req.cookies['key'];
    const { access_token } =
      await this.twoFactorAuthService.verifyTwoFactorAuthCode(login42, tfaCode);
    res.cookie('access_token', access_token);
    res.clearCookie('key');
    return {
      success: true,
    };
  }
}
