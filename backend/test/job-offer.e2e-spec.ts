import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/sub_services/supabaseClient';

describe('JobOfferModule (e2e)', () => {
  let realApp: INestApplication;
  let mockApp: INestApplication;

  let jobOfferId = '';
  let userId = '';

  const mockSupabaseClient = {
    auth: {
      getUser: jest.fn(),
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      refreshSession: jest.fn(),
    },
    storage: {
      from: jest.fn(),
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
    mockSupabaseClient.from.mockImplementation((table: string) => {
      if (table === 'PROJECTPOSTS') {
        const builder = makeQueryBuilder();
        builder.single.mockResolvedValue({
          data: {
            project_id: 'project-test-id',
            project_title: 'Proyecto de prueba',
            project_info: 'Descripción del proyecto',
            email: 'project@test.com',
            tags: ['frontend', 'node'],
            user_id: 'user-uuid-job-offer',
          },
          error: null,
        });
        return builder;
      }

      return makeQueryBuilder();
    });
  });

  describe('GET /JobOffer', () => {
    it('debe devolver el listado de ofertas con un arreglo válido', async () => {
      const response = await request(realApp.getHttpServer())
        .get('/JobOffer/JobOfferPosts?from=0&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('job_offers');
      expect(Array.isArray(response.body.job_offers)).toBe(true);
      expect(response.body.job_offers.length).toBeGreaterThan(0);

      if (response.body.job_offers.length > 0) {
        jobOfferId = response.body.job_offers[0].project_id;
        userId = response.body.job_offers[0].user_id;
      }
    });

    it('debe devolver una oferta específica por id', async () => {
      if (!jobOfferId) {
        const fallbackResponse = await request(realApp.getHttpServer())
          .get('/JobOffer/JobOfferPosts?from=0&limit=5')
          .expect(200);

        jobOfferId = fallbackResponse.body.job_offers[0]?.project_id || 'project-fallback';
      }

      const response = await request(realApp.getHttpServer())
        .get(`/JobOffer/JobOfferPost/${jobOfferId}`)
        .expect(200);

      expect(response.body).toHaveProperty('job_offer');
    });

    it('debe devolver las ofertas del usuario por id', async () => {
      if (!userId) {
        const fallbackResponse = await request(realApp.getHttpServer())
          .get('/JobOffer/JobOfferPosts?from=0&limit=5')
          .expect(200);

        userId = fallbackResponse.body.job_offers[0]?.user_id || 'user-fallback';
      }

      const response = await request(realApp.getHttpServer())
        .get(`/JobOffer/UserJobOfferPosts/${userId}?from=0&limit=5`)
        .expect(200);

      expect(response.body).toHaveProperty('job_offers');
      expect(Array.isArray(response.body.job_offers)).toBe(true);
    });
  });

  describe('POST /JobOffer', () => {
    it('debe crear una oferta laboral con un token válido', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-uuid-job-offer',
            email: 'project@test.com',
            app_metadata: { role: 'user' },
          },
        },
        error: null,
      });

      const response = await request(mockApp.getHttpServer())
        .post('/JobOffer/PostJobOffer')
        .set('Authorization', 'Bearer valid-job-offer-token')
        .send({
          project_title: 'Proyecto de prueba',
          project_info: 'Descripción del proyecto',
          email: 'project@test.com',
          tags: ['frontend', 'node'],
        })
        .expect(201);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toBe('Subida de oferta exitosa');
      expect(response.body.job_offer).toHaveProperty('project_id');
    });
  });
});
