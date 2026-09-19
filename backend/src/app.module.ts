import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import * as path from 'path';

import { SupabaseService } from './sub_services/supabaseClient';

import { GeneralPostsService } from './sub_services/general-posts.service';

import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';

import { ArtService } from './art/art.service';
import { ArtController } from './art/art.controller';
import { StorageService } from './sub_services/storage.service';

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
    GeneralPostsService,
    AuthService,
    StorageService,
    ArtService
  ],
})
export class AppModule {}
