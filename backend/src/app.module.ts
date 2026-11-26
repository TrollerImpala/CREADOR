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

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { SupabaseModule } from './modules/supabase.module';
import { PostsModule } from './modules/posts.module';
import { UserModule } from './modules/user.module';

@Module({
  imports: [
    // Carga el archivo .env del directorio desde donde se ejecuta el proceso.
    // isGlobal: true deja ConfigService disponible en toda la app sin reimportar.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: path.resolve(process.cwd(), '.env'),
    }),
    SupabaseModule,

    UserModule,

    PostsModule,
  ],
  // Cada controller declara un conjunto de rutas HTTP.
  controllers: [
    AppController,
  ],
  // Providers = clases que Nest instancia y puede inyectar por constructor.
  providers: [
    AppService,
  ],
})
export class AppModule {}
