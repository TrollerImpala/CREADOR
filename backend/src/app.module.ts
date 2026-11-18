/**
 * app.module.ts — Módulo raíz de NestJS.
 *
 * Capa: configuración / registro de la aplicación.
 * Es el "índice" del backend: todo controller y provider que exista debe
 * declararse acá o NestJS no lo va a conocer.
 *
 * Diferencia clave:
 * - controllers: reciben HTTP y delegan.
 * - providers: clases inyectables (services) que contienen lógica o acceso a datos.
 *
 * Si creás un módulo/controller nuevo y no lo registrás en este archivo,
 * la ruta responde 404 o Nest falla al resolver dependencias.
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import * as path from 'path';

import { SupabaseService } from './sub_services/supabaseClient';

import { StatsCreatorService } from './sub_services/stats_creator';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';

import { UserService } from './users/user.service';
import { UsersController } from './users/user.controller';

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
import { GeneralPostsService } from './general_posts/general_posts.service';
import { generalPostscontroller } from './general_posts/general_posts.controller';

@Module({
  imports: [
    // Carga el archivo .env del directorio desde donde se ejecuta el proceso.
    // isGlobal: true deja ConfigService disponible en toda la app sin reimportar.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '.env'),
    }),
  ],
  // Cada controller declara un conjunto de rutas HTTP.
  // Se listan todos los dominios: auth, usuarios, posts generales, arte,
  // música, films, games y ofertas de trabajo.
  controllers: [
    AppController,
    AuthController,
    UsersController,

    generalPostscontroller,

    ArtController,
    MusicController,
    FilmController,
    GameController,

    JobOfferController,
  ],
  // Providers = clases que Nest instancia y puede inyectar por constructor.
  // Acá viven los services de cada dominio y los servicios de infraestructura
  // (Supabase, storage, stats).
  providers: [
    AppService,
    SupabaseService,
    StatsCreatorService,

    AuthService,
    UserService,

    StorageService,

    ArtService,
    MusicService,
    FilmService,
    GameService,
    JobOfferService,
    GeneralPostsService,
  ],
})
export class AppModule {}
