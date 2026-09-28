import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import * as path from 'path';

import { SupabaseService } from './sub_services/supabaseClient';

import { GeneralPostsService } from './sub_services/general-posts.service';

import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';

import { ArtService } from './art/art.service';
import { ArtController } from './art/art.controller';

import { MusicService } from './music/music.service';
import { MusicController } from './music/music.controller';

import { FilmService } from './films/film.service';
import { FilmController } from './films/film.controller';

import { GameService } from './games/game.service';
import { GameController } from './games/game.controller';

import { JobOfferService } from './jobOffers/job-offer.service';
import { JobOfferController } from './jobOffers/job-offer.controller';

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
    ArtController,
    MusicController,
    FilmController,
    GameController,
    JobOfferController
  ],
  providers: [
    SupabaseService,
    GeneralPostsService,

    AuthService,

    StorageService,

    ArtService,
    MusicService,
    FilmService,
    GameService,
    JobOfferService
  ],
})
export class AppModule {}
