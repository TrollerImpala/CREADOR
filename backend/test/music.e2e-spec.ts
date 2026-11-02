import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/sub_services/supabaseClient';
import * as path from 'path';

describe('MusicModule (e2e)', () => {
  let realApp: INestApplication;
  let mockApp: INestApplication;

  let songId = '';
  let userId = '';

  const mockStorageBucket = {
    upload: jest.fn().mockResolvedValue({ error: null }),
    getPublicUrl: jest.fn().mockReturnValue({
      data: { publicUrl: 'https://example.com/music-file.mp3' },
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
      if (table === 'POSTSTATS') {
        const builder = makeQueryBuilder();
        builder.single.mockResolvedValue({
          data: { stats_id: 'stats-music-test' },
          error: null,
        });
        return builder;
      }

      if (table === 'MUSICPOSTS') {
        const builder = makeQueryBuilder();
        builder.single.mockResolvedValue({
          data: {
            song_id: 'song-test-id',
            song_name: 'Canción de prueba',
            song_description: 'Descripción de prueba',
            tags: ['demo'],
            rating: 'G',
            user_id: 'user-uuid-music',
            song_url: 'https://example.com/song.mp3',
            song_cover_url: 'https://example.com/cover.png',
          },
          error: null,
        });
        return builder;
      }

      return makeQueryBuilder();
    });
  });

  describe('GET /Music', () => {
    it('debe devolver el listado de música con un arreglo válido', async () => {
      const response = await request(realApp.getHttpServer())
        .get('/Music/MusicPosts?from=0&limit=5')
        .expect(200);

      expect(response.body).toHaveProperty('songs');
      expect(Array.isArray(response.body.songs)).toBe(true);
      expect(response.body.songs.length).toBeGreaterThan(0);

      if (response.body.songs.length > 0) {
        songId = response.body.songs[0].song_id;
        userId = response.body.songs[0].user_id;
      }
    });

    it('debe devolver una canción específica por id', async () => {
      if (!songId) {
        const fallbackResponse = await request(realApp.getHttpServer())
          .get('/Music/MusicPosts?from=0&limit=5')
          .expect(200);

        songId = fallbackResponse.body.songs[0]?.song_id || 'song-fallback';
      }

      const response = await request(realApp.getHttpServer())
        .get(`/Music/MusicPost/${songId}`)
        .expect(200);

      expect(response.body).toHaveProperty('song');
    });

    it('debe devolver las canciones del usuario por id', async () => {
      if (!songId) {
        const fallbackResponse = await request(realApp.getHttpServer())
          .get('/Music/MusicPosts?from=0&limit=5')
          .expect(200);

        songId = fallbackResponse.body.songs[0]?.song_id || 'song-fallback';
      }

      const detailResponse = await request(realApp.getHttpServer())
        .get(`/Music/MusicPost/${songId}`)
        .expect(200);

      userId = detailResponse.body.song?.user_id || 'user-fallback';

      const response = await request(realApp.getHttpServer())
        .get(`/Music/UserMusicPosts/${userId}?from=0&limit=5`)
        .expect(200);

      expect(response.body).toHaveProperty('songs');
      expect(Array.isArray(response.body.songs)).toBe(true);
    });
  });

  describe('POST /Music', () => {
    it('debe crear una publicación de música con un token válido', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: {
          user: {
            id: 'user-uuid-music',
            email: 'music@test.com',
            app_metadata: { role: 'user' },
          },
        },
        error: null,
      });

      const tinyPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64',
      );

      const tinyMp3 = Buffer.concat([
        Buffer.from('ID3\x03\x00\x00\x00\x00\x00\x00', 'binary'),
        Buffer.from([0xff, 0xfb, 0x90, 0x00]),
        Buffer.alloc(417),
      ]);

      const response = await request(mockApp.getHttpServer())
        .post('/Music/PostMusic')
        .set('Authorization', 'Bearer valid-music-token')
        .field('song_name', 'Canción de prueba')
        .field('song_description', 'Descripción de prueba')
        .field('tags', 'demo,prueba')
        .field('rating', 'G')
        .attach('song_file', tinyMp3, {
          filename: 'song.mp3',
          contentType: 'audio/mpeg',
        })
        .attach('song_cover_img', tinyPng, {
          filename: 'cover.png',
          contentType: 'image/png',
        });

      console.log('A VER DONDE ESTAS ERROR', response.status, response.body);

      expect(response.status).toBe(201);

      expect(response.body).toHaveProperty('mensaje');
      expect(response.body.mensaje).toBe('Subida de musica exitosa');
      expect(response.body.song).toHaveProperty('song_id');
    });
  });
});
