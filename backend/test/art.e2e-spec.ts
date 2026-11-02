import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/sub_services/supabaseClient';

describe('ArtModule (e2e)', () => {
  let realApp: INestApplication;
  let mockApp: INestApplication;

  let artPostId = '';
  let userId = '';

  const mockStorageBucket = {
    upload: jest.fn().mockResolvedValue({ error: null }),
    getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/art.png' } }),
    remove: jest.fn().mockResolvedValue({ error: null }),
  };

  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      refreshSession: jest.fn(),
    },
    storage: {
      from: jest.fn().mockReturnValue(mockStorageBucket),
    },
    from: jest.fn(),
  };

  const mockSupabaseService = {
    getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    getUserClient: jest.fn(),
  };

  const makeQueryBuilder = () => ({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    neq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    single: jest.fn(),
  });

  beforeAll(async () => {
    const realModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    realApp = realModule.createNestApplication();
    realApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await realApp.init();

    const mockModule: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(SupabaseService)
      .useValue(mockSupabaseService)
      .compile();

    mockApp = mockModule.createNestApplication();
    mockApp.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await mockApp.init();
  });

  afterAll(async () => {
    await realApp.close();
    await mockApp.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabaseClient.storage.from.mockReturnValue(mockStorageBucket);
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'POSTSTATS') {
        const builder = makeQueryBuilder();
        builder.single.mockResolvedValue({
          data: { stats_id: 'stats-art-test' },
          error: null,
        });
        return builder;
      }

      if (table === 'ARTPOSTS') {
        const builder = makeQueryBuilder();
        builder.single.mockResolvedValue({
          data: {
            artpost_id: 'artpost-test-id',
            title: 'Arte de prueba',
            description: 'Descripción de prueba',
            tags: ['demo'],
            rating: 'G',
            user_id: 'user-uuid-art',
            art_img_url: 'https://example.com/art.png',
          },
          error: null,
        });
        return builder;
      }

      return makeQueryBuilder();
    });
  });

  describe('GET /Art', () => {
    it('debe devolver el listado de arte con un arreglo válido', async () => {
      const response = await request(realApp.getHttpServer())
        .get('/Art/ArtPosts?from=0&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('art');
      expect(Array.isArray(response.body.art)).toBe(true);
      expect(response.body.art.length).toBeGreaterThan(0);

      if (response.body.art.length > 0) {
        artPostId = response.body.art[0].artpost_id;
        userId = response.body.art[0].user_id;
      }
    });

    it('debe devolver un arte específico por id', async () => {
      if (!artPostId) {
        const fallbackResponse = await request(realApp.getHttpServer())
          .get('/Art/ArtPosts?from=0&limit=5')
          .expect(200);

        artPostId = fallbackResponse.body.art[0]?.artpost_id || 'artpost-fallback';
      }

      const response = await request(realApp.getHttpServer())
        .get(`/Art/ArtPost/${artPostId}`)
        .expect(200);

      expect(response.body).toHaveProperty('art');
    });

    it('debe devolver los posts del usuario por id', async () => {
      if (!artPostId) {
        const fallbackResponse = await request(realApp.getHttpServer())
          .get('/Art/ArtPosts?from=0&limit=5')
          .expect(200);

        artPostId = fallbackResponse.body.art[0]?.artpost_id || 'artpost-fallback';
      }

      const detailResponse = await request(realApp.getHttpServer())
        .get(`/Art/ArtPost/${artPostId}`)
        .expect(200);

      userId = detailResponse.body.art?.user_id || 'user-fallback';

      const response = await request(realApp.getHttpServer())
        .get(`/Art/UserArtPosts/${userId}?from=0&limit=5`)
        .expect(200);

      expect(response.body).toHaveProperty('art');
      expect(Array.isArray(response.body.art)).toBe(true);
    });
  });

  describe('POST /Art', () => {
    it('debe crear una publicación de arte con un token válido', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-uuid-art',
            email: 'art@test.com',
            app_metadata: { role: 'user' },
          },
        },
        error: null,
      });

      const response = await request(mockApp.getHttpServer())
        .post('/Art/PostArt')
        .set('Authorization', 'Bearer valid-art-token')
        .field('title', 'Arte de prueba')
        .field('description', 'Descripción de prueba')
        .field('tags', 'demo,prueba')
        .field('rating', 'G')
        .attach('art_img', Buffer.from('fake-art-image'), {
          filename: 'art.png',
          contentType: 'image/png',
        })
        .expect(201);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toBe('Subida de arte exitosa');
      expect(response.body.art).toHaveProperty('artpost_id');
    });
  });
});
