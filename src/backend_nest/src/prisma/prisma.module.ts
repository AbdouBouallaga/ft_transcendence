import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersPrismaService } from './users-prisma.service';

@Global()
@Module({
  providers: [PrismaService, UsersPrismaService],
  exports: [UsersPrismaService]
})
export class PrismaModule {}
