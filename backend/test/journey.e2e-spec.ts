import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/sub_services/supabaseClient';
import { StorageService } from '../src/sub_services/storage.service';

describe('Flujo Completo de Usuario (E2E User Journey)', () => {
    let app: INestApplication;

    // Variables para guardar el estado del usuario a lo largo de la sesión
    let userAccessToken: string;
    let userRefreshToken: string;
    let createdUserId: string;

    // Mocks de Storage internos de Supabase (igual que en art.e2e-spec.ts)
    const mockStorageBucket = {
        upload: jest.fn().mockResolvedValue({ error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/art.png' } }),
        remove: jest.fn().mockResolvedValue({ error: null }),
    };

    // Mocks principales de SupabaseClient
    const mockSupabaseClient = {
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            getUser: jest.fn(),
            signOut: jest.fn(),
        },
        storage: {
            from: jest.fn().mockReturnValue(mockStorageBucket),
        },
        from: jest.fn(),
    };

    const mockUserClient = {
        auth: {
            signOut: jest.fn(),
        },
    };

    const mockSupabaseService = {
        getClient: jest.fn().mockReturnValue(mockSupabaseClient),
        getUserClient: jest.fn().mockReturnValue(mockUserClient),
    };

    // Helper para construir la interfaz fluida del query builder
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
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
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

    beforeEach(() => {
        mockSupabaseClient.storage.from.mockReturnValue(mockStorageBucket);
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

        // Mock para la consulta de la tabla USERS en Login
        mockSupabaseClient.from.mockImplementation((table: string) => {
            if (table === 'USERS') {
                const builder = makeQueryBuilder();
                builder.single.mockResolvedValue({
                    data: { id_user: createdUserId, user_name: 'Journey User', user_avatar_url: null },
                    error: null,
                });
                return builder;
            }
            return makeQueryBuilder();
        });

        const loginRes = await request(app.getHttpServer())
            .post('/Auth/Login')
            .send(mockLoginCredentials)
            .expect(201);

        userAccessToken = loginRes.body.user_token;
        userRefreshToken = loginRes.body.refresh_token;

        expect(userAccessToken).toBeDefined();
        expect(loginRes.body.user.id_user).toBe(createdUserId);

        console.log('✓ Paso 1 Completado: Tokens de usuario obtenidos con éxito.');
    });

    let artPostId: string;

    it('Paso 2: Crear, Ver, Listar y Eliminar Publicación de Arte', async () => {
        const mockArtPayload = {
            artpost_id: 'artpost-uuid-123',
            title: 'Arte de e2e',
            description: 'Descripción del Arte del e2e',
            tags: ['e2e', 'puntaapunta', 'prueba'],
            rating: 'G',
            user_id: createdUserId,
            art_img_url: 'https://example.com/art.png',
            stats_id: 'stats-art-test',
        };

        // -------------------------------------------------------------
        // MOCK DE TABLAS (POSTSTATS y ARTPOSTS)
        // -------------------------------------------------------------
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
                        ...mockArtPayload,
                        USERS: {
                            user_name: 'Journey User',
                            user_tag: 'journey_dev',
                            user_avatar_url: null,
                        },
                    },
                    error: null,
                });
                builder.range.mockResolvedValue({
                    data: [mockArtPayload],
                    error: null,
                });
                return builder;
            }

            return makeQueryBuilder();
        });

        // -------------------------------------------------------------
        // 2.1 CREAR POST DE ARTE
        // -------------------------------------------------------------
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
        // 2.2 VER UN POST ESPECÍFICO DE ARTE
        // -------------------------------------------------------------
        const getRes = await request(app.getHttpServer())
            .get(`/Art/ArtPost/${artPostId}`)
            .expect(200);

        expect(getRes.body).toHaveProperty('art');
        expect(getRes.body.art.artpost_id).toBe(artPostId);
        expect(getRes.body.mensaje).toBe('Arte obtenido');

        // -------------------------------------------------------------
        // 2.3 OBTENER LISTADO GENERAL Y POR USUARIO
        // -------------------------------------------------------------
        const listRes = await request(app.getHttpServer())
            .get('/Art/ArtPosts?from=0&limit=10')
            .expect(200);

        expect(listRes.body.mensaje).toBe('Arte obtenido');
        expect(Array.isArray(listRes.body.art)).toBe(true);

        const userListRes = await request(app.getHttpServer())
            .get(`/Art/UserArtPosts/${createdUserId}?from=0&limit=10`)
            .expect(200);

        expect(userListRes.body.mensaje).toBe('Arte del usuario obtenido');
        expect(Array.isArray(userListRes.body.art)).toBe(true);

        // -------------------------------------------------------------
        // 2.4 ELIMINAR POST CREADO
        // -------------------------------------------------------------
        const deleteRes = await request(app.getHttpServer())
            .delete(`/GeneralPosts/Deleteposts/${artPostId}?tipo=arte`)
            .set('Authorization', `Bearer ${userAccessToken}`)
            .expect(200);

        expect(deleteRes.body.mensaje).toBe('Post eliminado con exito');
        expect(deleteRes.body.deletedData.artpost_id).toBe(artPostId);

        console.log('✓ Paso 2 Completado: Publicación creada, consultada, listada y eliminada con éxito.');
    });

    it('Paso 3: Cierre de Sesión (LogOut)', async () => {
        // -------------------------------------------------------------
        // 3.1 CERRAR SESIÓN DE USUARIO
        // -------------------------------------------------------------
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

        mockUserClient.auth.signOut.mockResolvedValue({
            error: null,
        });

        const logoutRes = await request(app.getHttpServer())
            .post('/Auth/LogOut')
            .set('Authorization', `Bearer ${userAccessToken}`)
            .expect(201);

        expect(logoutRes.body.mensaje).toBe('Cierre de sesión exitoso');

        console.log('✓ Paso 3 Completado: Cierre de sesión finalizado exitosamente.');
    });
});