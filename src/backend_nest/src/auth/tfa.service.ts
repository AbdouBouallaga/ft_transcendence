import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { authenticator } from 'otplib';
import { UserPrismaService } from 'src/prisma/user.service';
import { toDataURL } from 'qrcode';
import { JwtService } from '@nestjs/jwt';
import * as CryptoJS from 'crypto-js';

@Injectable()
export class TwoFactorAuthService {
  constructor(
    private readonly userPrisma: UserPrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async setTwoFactorAuthSecret(
    login42: string,
    tfaSecret: string,
  ): Promise<User> {
    return await this.userPrisma.setTwoFactorAuthSecret(login42, tfaSecret);
  }

  async setTwoFactorAuthEnabled(
    login42: string,
    tfaEnabled: boolean,
  ): Promise<User> {
    return await this.userPrisma.setTwoFactorAuthEnabled(login42, tfaEnabled);
  }

  async generateTwoFactorAuthSecret(
    login42: string,
  ): Promise<{ otpAuthURL: string }> {
    const secret = authenticator.generateSecret();
    const otpAuth = authenticator.keyuri(
      login42,
      process.env.AUTH_APP_NAME,
      secret,
    );
    const encryptedSecret = CryptoJS.AES.encrypt(
      secret,
      process.env.PASSPHRASE_SECRET,
    ).toString();
    await this.userPrisma.setTwoFactorAuthSecret(login42, encryptedSecret);
    const otpAuthURL = await toDataURL(otpAuth);
    return { otpAuthURL };
  }

  async verifyTwoFactorAuthCode(
    login42: string,
    tfaCode: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userPrisma.findUserByLogin42(login42);
    if (!user) {
      throw new InternalServerErrorException();
    }
    const bytes = CryptoJS.AES.decrypt(
      user.tfaSecret,
      process.env.PASSPHRASE_SECRET,
    );
    const secret = bytes.toString(CryptoJS.enc.Utf8);
    const isValid = authenticator.verify({
      token: tfaCode,
      secret,
    });
    if (!isValid) {
      throw new UnauthorizedException();
    }
    const payload = {
      sub: user.id,
      login42: user.login42,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
