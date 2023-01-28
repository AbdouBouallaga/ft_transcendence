import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserPrismaService } from './user.service';

@Global()
@Module({
  providers: [PrismaService, UserPrismaService],
  exports: [PrismaService, UserPrismaService]
})
export class PrismaModule {}
