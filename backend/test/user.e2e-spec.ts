import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/sub_services/supabaseClient';

describe('UserModule (e2e)', () => {
  let realApp: INestApplication;
  let mockApp: INestApplication;

  let userId = '';

  const mockStorageBucket = {
    upload: jest.fn().mockResolvedValue({ error: null }),
    getPublicUrl: jest.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/avatar.png' },
    }),
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
      if (table === 'USERS') {
        const builder = makeQueryBuilder();
        builder.single.mockResolvedValue({
          data: {
            id_user: 'user-uuid-profile',
            user_tag: 'demo_user',
            user_name: 'Demo User',
            user_description: 'Descripción demo',
            user_avatar_url: null,
            social_medias: [],
          },
          error: null,
        });
        return builder;
      }

      return makeQueryBuilder();
    });
  });

  describe('GET /Users', () => {
    it('debe devolver el perfil público del usuario por id', async () => {
      const listResponse = await request(realApp.getHttpServer())
        .get('/Art/ArtPosts?from=0&limit=5')
        .expect(200);

      const artPostId = listResponse.body.art[0]?.artpost_id;

      const detailResponse = await request(realApp.getHttpServer())
        .get(`/Art/ArtPost/${artPostId}`)
        .expect(200);

      userId = detailResponse.body.art?.user_id || 'user-uuid-profile';

      const response = await request(realApp.getHttpServer())
        .get(`/Users/Usuario/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('publicUser');
      expect(response.body.mensaje).toBe('Perfil publico obtenido');
    });
  });

  describe('POST /Users', () => {
    it('debe devolver el perfil privado del usuario con token válido', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-uuid-profile',
            email: 'profile@test.com',
            app_metadata: { role: 'user' },
          },
        },
        error: null,
      });

      const response = await request(mockApp.getHttpServer())
        .post('/Users/Perfil')
        .set('Authorization', 'Bearer valid-profile-token')
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body.mensaje).toBe('Perfil obtenido');
    });
  });

  describe('PUT /Users', () => {
    it('debe actualizar el perfil del usuario con token válido', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-uuid-profile',
            email: 'profile@test.com',
            app_metadata: { role: 'user' },
          },
        },
        error: null,
      });

      const response = await request(mockApp.getHttpServer())
        .put('/Users/ActualizarPerfil')
        .set('Authorization', 'Bearer valid-profile-token')
        .field('userTag', 'demo_user_updated')
        .field('userName', 'Demo User Updated')
        .field('userDescription', 'Actualización de prueba')
        .attach('profile_img', Buffer.from('fake-avatar'), {
          filename: 'avatar.png',
          contentType: 'image/png',
        })
        .expect(200);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toContain('Usuario');
      expect(response.body.user).toHaveProperty('id_user');
    });
  });
});
