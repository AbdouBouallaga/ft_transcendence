import { Injectable } from '@nestjs/common';
import { UserPrismaService } from 'src/prisma/user.service';

@Injectable()
export class UsersService {
    constructor(private readonly userPrisma: UserPrismaService) {}
}
