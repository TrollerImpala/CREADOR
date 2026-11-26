import { Module } from '@nestjs/common';

import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';

import { UsersController } from '../users/user.controller';
import { UserService } from '../users/user.service';

@Module({
    controllers: [
        AuthController,
        UsersController,
    ],
    providers: [
        AuthService,
        UserService,
    ],
})
export class UserModule {}