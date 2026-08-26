import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  console.log(process.env.SUPABASE_URL);

  app.enableCors();

  app.setGlobalPrefix('api');
  
  await app.listen(process.env.PORT ?? 8080);
  console.log('Servidor NestJS corriendo en http://localhost:8080/api');
}
bootstrap();