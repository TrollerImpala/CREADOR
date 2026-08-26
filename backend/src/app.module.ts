import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import * as path from 'path';

import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { SupabaseService } from './config/supabaseClient';

@Module({
  imports: [
    ConfigModule.forRoot( {
      isGlobal : true,
      envFilePath : path.resolve(process.cwd(), '.env'),
    } ),
  ],
  controllers: [AuthController],
  providers: [AuthService, SupabaseService],
})
export class AppModule {}
