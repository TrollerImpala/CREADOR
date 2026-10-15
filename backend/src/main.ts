import { ValidationPipe } from '@nestjs/common';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();

  app.setGlobalPrefix('api');
  //console.log(process.env.SUPABASE_URL);

  app.useGlobalPipes(new ValidationPipe({ transform : true, whitelist : true}));

  const document = new DocumentBuilder()
    .setTitle('API de CREADOR')
    .setDescription('API para gestionar peticiones de CREADOR')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const documentService = SwaggerModule.createDocument(app, document);
  
  SwaggerModule.setup('secret', app, documentService);

  const port = process.env.PORT || 8080;
  await app.listen(port);

  console.log(`Servidor NestJS corriendo en http://localhost:${port}/api`);
  console.log(`Swagger docs corriendo en http://localhost:${port}/secret`);
}
bootstrap();