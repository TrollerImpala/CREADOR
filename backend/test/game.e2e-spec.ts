import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('GameModule (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('debe devolver la lista de juegos', async () => {
    const response = await request(app.getHttpServer())
      .get('/Game/GamePosts')
      .expect(200);

    expect(response.body).toHaveProperty('games');
    expect(Array.isArray(response.body.games)).toBe(true);
  });
});
