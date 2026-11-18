/**
 * main.ts — Punto de entrada (bootstrap) del backend.
 *
 * Capa: configuración global / arranque.
 * No tiene lógica de negocio: crea la app NestJS, aplica configuración
 * global y deja el servidor HTTP escuchando.
 *
 * Orden de arranque:
 * 1. NestFactory.create(AppModule) instancia módulos, controllers y services.
 * 2. enableCors() permite llamadas desde el frontend (otro origen).
 * 3. setGlobalPrefix('api') antepone /api a todas las rutas.
 * 4. ValidationPipe valida y transforma los DTO de forma global.
 * 5. Swagger se publica en /secret.
 * 6. app.listen() usa PORT o 8080.
 */
import { ValidationPipe } from '@nestjs/common';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // Crea la aplicación a partir del módulo raíz. Si un controller no está
  // registrado en AppModule, su ruta no existe.
  const app = await NestFactory.create(AppModule);

  // CORS abierto: permite que el frontend (localhost:5173 o Render) llame a la API.
  // En producción conviene restringirlo al origen real del frontend.
  app.enableCors();

  // Todas las rutas de los controllers quedan bajo /api (ej. /api/Auth/Login).
  app.setGlobalPrefix('api');
  //console.log(process.env.SUPABASE_URL);

  // Validación global de DTOs:
  // - transform: convierte el body plano en una instancia del DTO.
  // - whitelist: elimina campos que no tengan decorador en el DTO.
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  // Metadata de Swagger/OpenAPI. addBearerAuth() habilita el botón
  // "Authorize" para probar endpoints protegidos con un token.
  const document = new DocumentBuilder()
    .setTitle('API de CREADOR')
    .setDescription('API para gestionar peticiones de CREADOR')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  // Escanea controllers y DTOs para generar la documentación.
  const documentService = SwaggerModule.createDocument(app, document);

  // Publica Swagger en /secret (no lleva el prefijo /api).
  SwaggerModule.setup('secret', app, documentService);

  // Render asigna el puerto por variable de entorno; en local cae en 8080.
  const port = process.env.PORT || 8080;
  await app.listen(port);

  console.log(`Servidor NestJS corriendo en http://localhost:${port}/api`);
  console.log(`Swagger docs corriendo en http://localhost:${port}/secret`);
}
// Arranca el bootstrap una sola vez por proceso (no en cada request).
bootstrap();
