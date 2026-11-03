import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/sub_services/supabaseClient';
import { StorageService} from '../src/sub_services/storage.service';

describe('Flujo Completo de Usuario (E2E User Journey)', () => {
    let app: INestApplication;
    
    // Variables para guardar el estado del usuario a lo largo de la sesión
    let userAccessToken: string;
    let userRefreshToken: string;
    let createdUserId: string;

    // Mocks de Supabase para aislar la base de datos durante el flujo
    const mockSupabaseClient = {
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            getUser: jest.fn(),
        },
        from: jest.fn(),
    };

    const mockSupabaseService = {
        getClient: jest.fn().mockReturnValue(mockSupabaseClient),
        getUserClient: jest.fn(),
    };

    const mockStorageService = {
        upload: jest.fn().mockReturnValue( 'https://example.com/art.png' ),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/art.png' } }),
        remove: jest.fn().mockResolvedValue({ error: null }),
    };

    const storageQueryBuilder = () => ({

    })

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [
                {
                    provide: StorageService,
                    useValue: mockStorageService,
                }
            ]
        })
            .overrideProvider(SupabaseService)
            .useValue(mockSupabaseService)
            .compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('Paso 1: Flujo de Autenticación de Usuario (Registro -> Login -> Obtener Token)', async () => {
        // -------------------------------------------------------------
        // 1.1 REGISTRO DE USUARIO
        // -------------------------------------------------------------
        const mockUserPayload = {
            email: 'userjourney@domain.com',
            password: 'Password123!',
            userTag: 'journey_dev',
            userName: 'Journey User',
        };

        mockSupabaseClient.auth.signUp.mockResolvedValue({
            data: { user: { id: 'uuid-user-journey-123', email: mockUserPayload.email } },
            error: null,
        });

        const registerRes = await request(app.getHttpServer())
            .post('/Auth/Register')
            .send(mockUserPayload)
            .expect(201);

        expect(registerRes.body.mensaje).toBe('Usuario registrado con exito');
        createdUserId = registerRes.body.user.id;

        // -------------------------------------------------------------
        // 1.2 INICIO DE SESIÓN (LOGIN)
        // -------------------------------------------------------------
        const mockLoginCredentials = {
            email: mockUserPayload.email,
            password: mockUserPayload.password,
        };

        mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
            data: {
                user: { id: createdUserId, app_metadata: { role: 'user' } },
                session: {
                    access_token: 'journey_access_token_xyz',
                    refresh_token: 'journey_refresh_token_xyz',
                },
            },
            error: null,
        });

        // Mock para la consulta interna a la tabla USERS
        const mockQueryBuilder = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: { id_user: createdUserId, user_name: 'Journey User', user_avatar_url: null },
            }),
        };
        mockSupabaseClient.from.mockReturnValue(mockQueryBuilder);

        const loginRes = await request(app.getHttpServer())
            .post('/Auth/Login')
            .send(mockLoginCredentials)
            .expect(201);

        // Guardamos los tokens retornados para los siguientes pasos del test (ej. crear publicaciones)
        userAccessToken = loginRes.body.user_token;
        userRefreshToken = loginRes.body.refresh_token;

        expect(userAccessToken).toBeDefined();
        expect(loginRes.body.user.id_user).toBe(createdUserId);

        console.log('✓ Paso 1 Completado: Tokens de usuario obtenidos con éxito.');
    });

    let artPostId: string;

    // Paso 2 (Crear, Ver y Eliminar publicación usando `userAccessToken`)
    it('Paso 2: Crear, Ver, y Eliminar Publicación de Arte', async () => {
        // -------------------------------------------------------------
        // 2.1 CREAR POST DE ARTE
        // -------------------------------------------------------------
        const mockArtPayload = {
            artpost_id: 'artpost-uuid-123',
            title: 'Arte de e2e',
            description: 'Descripción del Arte del e2e',
            tags: ['e2e', 'puntaapunta', 'prueba'],
            rating: 'G',
            user_id: createdUserId,
            art_img_url: 'https://example.com/art.png',
            stats_id: 'stats-uuid-999',
        };

        // Mock para la creación de Stats y la inserción del Post en Supabase
        const mockInsertQueryBuilder = {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: mockArtPayload,
                error: null,
            }),
        };

        mockSupabaseClient.from.mockReturnValue(mockInsertQueryBuilder);

        const createRes = await request(app.getHttpServer())
            .post('/Art/PostArt')
            .set('Authorization', `Bearer ${userAccessToken}`)
            .field('title', 'Arte de e2e')
            .field('description', 'Descripción del Arte del e2e')
            .field('tags', 'e2e,puntaapunta,prueba')
            .field('rating', 'G')
            .attach('art_img', Buffer.from('fake-art-image'), {
                filename: 'art.png',
                contentType: 'image/png',
            })
            .expect(201);

        expect(createRes.body).toHaveProperty('art');
        expect(createRes.body.mensaje).toBe('Subida de arte exitosa');
        expect(createRes.body.art).toHaveProperty('artpost_id');

        artPostId = createRes.body.art.artpost_id;

        // -------------------------------------------------------------
        // 2.2 VER POST CREADO
        // -------------------------------------------------------------
        const mockGetSingleQueryBuilder = {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
                data: {
                    ...mockArtPayload,
                    USERS: {
                        user_name: 'Journey User',
                        user_tag: 'journey_dev',
                        user_avatar_url: null,
                    },
                },
                error: null,
            }),
        };

        mockSupabaseClient.from.mockReturnValue(mockGetSingleQueryBuilder);

        const getRes = await request(app.getHttpServer())
            .get(`/Art/ArtPost/${artPostId}`)
            .expect(200);

        expect(getRes.body).toHaveProperty('art');
        expect(getRes.body.art.artpost_id).toBe(artPostId);
        expect(getRes.body.mensaje).toBe('Arte obtenido');

        // -------------------------------------------------------------
        // 2.3 ELIMINAR POST CREADO
        // -------------------------------------------------------------
        // Mock de autenticación para que el SupabaseAuthGuard identifique al usuario
        mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: {
                user: {
                    id: createdUserId,
                    role: 'user',
                    email: 'userjourney@domain.com',
                },
            },
            error: null,
        });

        // Mock para:
        // 1. Verificación de dueño en GeneralPostsService (select user_id)
        // 2. Borrado del post en ArtService (delete().eq().select().single())
        const mockDeleteQueryBuilder = {
            select: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn()
                // Primera llamada (GeneralPostsService): Retorna el user_id para validar dueño
                .mockResolvedValueOnce({
                    data: { user_id: createdUserId },
                    error: null,
                })
                // Segunda llamada (ArtService.deletePost): Retorna la data eliminada
                .mockResolvedValueOnce({
                    data: mockArtPayload,
                    error: null,
                }),
        };

        mockSupabaseClient.from.mockReturnValue(mockDeleteQueryBuilder);

        const deleteRes = await request(app.getHttpServer())
            .delete(`/GeneralPosts/Deleteposts/${artPostId}?tipo=arte`)
            .set('Authorization', `Bearer ${userAccessToken}`)
            .expect(200);

        expect(deleteRes.body.mensaje).toBe('Post eliminado con exito');
        expect(deleteRes.body.deletedData.artpost_id).toBe(artPostId);

        console.log('✓ Paso 2 Completado: Publicación creada, consultada y eliminada con éxito.');
    });

});