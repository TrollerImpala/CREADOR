import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import * as path from 'path';

import { SupabaseService } from './config/supabaseClient';

import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';

import { ArtService } from './art/art.service';
import { ArtController } from './art/art.controller';

@Module({
  imports: [
    ConfigModule.forRoot( {
      isGlobal : true,
      envFilePath : path.resolve(process.cwd(), '.env'),
    } ),
  ],
  controllers: [
    AuthController,
    ArtController
  ],
  providers: [
    SupabaseService,
    AuthService,
    ArtService
  ],
})
export class AppModule {}
