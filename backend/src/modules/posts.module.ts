import { Module } from '@nestjs/common';
import { ArtController } from '../art/art.controller';
import { ArtService } from '../art/art.service';

import { MusicController } from '../music/music.controller';
import { MusicService } from '../music/music.service';

import { FilmController } from '../films/film.controller';
import { FilmService } from '../films/film.service';

import { GameController } from '../games/game.controller';
import { GameService } from '../games/game.service';

import { JobOfferController } from '../jobOffers/job-offer.controller';
import { JobOfferService } from '../jobOffers/job-offer.service';

import { generalPostscontroller } from '../general_posts/general_posts.controller';
import { GeneralPostsService } from '../general_posts/general_posts.service';

@Module({
  controllers: [
    ArtController,
    MusicController,
    FilmController,
    GameController,
    JobOfferController,
    generalPostscontroller, 
    ],

  providers: [
    ArtService,
    MusicService,
    FilmService,
    GameService,
    JobOfferService,
    GeneralPostsService,
    ],
})
export class PostsModule {}