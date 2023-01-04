import { Body, Controller, Get, Req, Res, UseGuards } from "@nestjs/common";
import { TwoFactorAuthService } from "./tfa.service";
import { JwtAuthGuard } from "./guards";
import { Response } from "express";

@Controller('auth/tfa')
export class TwoFactorAuthController {
    constructor(private readonly twoFactorAuthService: TwoFactorAuthService) {}

    @Get('generate')
    @UseGuards(JwtAuthGuard)
    async enableTwoFactorAuth(@Req() req: any) : Promise<{ otpAuthURL: string }> {
        const login42 = req.user.login42;
        return await this.twoFactorAuthService.generateTwoFactorAuthSecret(login42);
    }

    @Get('disable')
    @UseGuards(JwtAuthGuard)
    async disableTwoFactorAuth(@Req() req: any) {
        const login42 = req.user.login42;
        await this.twoFactorAuthService.setTwoFactorAuthEnabled(login42, false);
    }

    @Get('enable')
    @UseGuards(JwtAuthGuard)
    async confirmTwoFactorAuthEnabling(@Req() req: any, @Res({ passthrough: true }) res: Response, @Body('tfaCode') tfaCode: string) {
        const login42 = req.user.login42;
        const { access_token } = await this.twoFactorAuthService.verifyTwoFactorAuthCode(login42, tfaCode);
        await this.twoFactorAuthService.setTwoFactorAuthEnabled(login42, true);
        res.cookie('access_token', access_token);
    }

    @Get('verify')
    async verifyTwoFactorAuthEnabling(@Res({ passthrough: true }) res: Response, @Body('login42') login42: string, @Body('tfaCode') tfaCode: string) {
        const { access_token } = await this.twoFactorAuthService.verifyTwoFactorAuthCode(login42, tfaCode);
        res.cookie('access_token', access_token);
        res.redirect('http://127.0.0.1.nip.io');
    }
}
