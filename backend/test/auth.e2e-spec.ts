import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module'; // O tu AuthModule si lo pruebas aislado
import { SupabaseService } from '../src/sub_services/supabaseClient';

describe('AuthModule (e2e)', () => {
    let app: INestApplication;

    // Builder para mockear las consultas de Supabase en el servicio
    const QueryMockBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
    };

    // Mocks del cliente Supabase
    const mockSupabaseClient = {
        from: jest.fn().mockReturnValue(QueryMockBuilder),
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            refreshSession: jest.fn(),
            getUser: jest.fn(),
        },
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

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(SupabaseService)
            .useValue(mockSupabaseService)
            .compile();

        app = moduleFixture.createNestApplication();

        // IMPORTANTE: Registrar el ValidationPipe global tal como lo tienes en el main.ts
        app.useGlobalPipes(
            new ValidationPipe({
                whitelist: true,
                transform: true,
            })
        );

        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // ------------------------------------------------------------------
    // POST /Auth/Register
    // ------------------------------------------------------------------
    describe('POST /Auth/Register', () => {
        it('debe registrar un usuario y retornar 201 Created', async () => {
            const registerDto = {
                email: 'integration@test.com',
                password: 'Password123!',
                userTag: 'integration_tag',
                userName: 'Integration User',
            };

            mockSupabaseClient.auth.signUp.mockResolvedValue({
                data: { user: { id: 'user-uuid-123', email: registerDto.email } },
                error: null,
            });

            const response = await request(app.getHttpServer())
                .post('/Auth/Register')
                .send(registerDto)
                .expect(201);

            expect(response.body).toEqual({
                mensaje: 'Usuario registrado con exito',
                user: { id: 'user-uuid-123', email: registerDto.email },
            });
        });

        it('debe devolver 400 Bad Request si el DTO falla en la validación (ValidationPipe)', async () => {
            const invalidDto = {
                email: 'email-invalido', // No es un email válido
            };

            const response = await request(app.getHttpServer())
                .post('/Auth/Register')
                .send(invalidDto)
                .expect(400);

            // Verifica que el pipe de validación frenó la petición antes del controlador
            expect(response.body.message).toBeDefined();
        });
    });

    // ------------------------------------------------------------------
    // POST /Auth/Login
    // ------------------------------------------------------------------
    describe('POST /Auth/Login', () => {
        it('debe iniciar sesión correctamente y retornar 201 Created con tokens', async () => {
            const loginDto = {
                email: 'integration@test.com',
                password: 'Password123!',
            };

            mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
                data: {
                    user: { id: 'user-uuid-123', app_metadata: { role: 'user' } },
                    session: {
                        access_token: 'mock_access_token',
                        refresh_token: 'mock_refresh_token',
                    },
                },
                error: null,
            });

            QueryMockBuilder.single.mockResolvedValue({
                data: {
                    id_user: 'user-uuid-123',
                    user_name: 'Integration User',
                    user_avatar_url: null,
                },
                error: null,
            });

            const response = await request(app.getHttpServer())
                .post('/Auth/Login')
                .send(loginDto)
                .expect(201);

            expect(response.body).toEqual({
                mensaje: 'Usuario logeado con exito',
                user_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                user: {
                    id_user: 'user-uuid-123',
                    user_name: 'Integration User',
                    user_avatar_url: null,
                },
                role: 'user',
            });
        });
    });

    // ------------------------------------------------------------------
    // POST /Auth/LogOut (Prueba de Guard + Headers)
    // ------------------------------------------------------------------
    describe('POST /Auth/LogOut', () => {
        it('debe rechazar con 401 Unauthorized si el SupabaseAuthGuard no recibe token', async () => {
            await request(app.getHttpServer())
                .post('/Auth/LogOut')
                .expect(401);
        });

        it('debe permitir cerrar sesión si el SupabaseAuthGuard valida el token correctamente', async () => {
            const validToken = 'valid_bearer_token';

            // 1. Simular la respuesta del Guard (auth.getUser)
            mockSupabaseClient.auth.getUser.mockResolvedValue({
                data: {
                    user: {
                        id: 'user-uuid-123',
                        email: 'test@domain.com',
                        app_metadata: { role: 'user' },
                    },
                },
                error: null,
            });

            // 2. Simular la respuesta del logout en el servicio (signOut)
            mockUserClient.auth.signOut.mockResolvedValue({ error: null });

            const response = await request(app.getHttpServer())
                .post('/Auth/LogOut')
                .set('Authorization', `Bearer ${validToken}`)
                .expect(201);

            expect(response.body).toEqual({
                mensaje: 'Cierre de sesión exitoso',
            });
        });
    });
    // ------------------------------------------------------------------
    // POST /Auth/Refresh
    // ------------------------------------------------------------------
    describe('POST /Auth/Refresh', () => {
        it('debe rechazar con 401 Unauthorized si el refresh_token no se provee', async () => {
            await request(app.getHttpServer())
                .post('/Auth/Refresh')
                .send({})
                .expect(400);
        });

        it('debe devolver nuevos tokens (access_token y refresh_token) al recibir un refresh_token valido', async () => {
            const validToken = 'valid_refresh_token';

            // 1. Simular la respuesta del refresh en el servicio (refresh)
            mockSupabaseClient.auth.refreshSession.mockResolvedValue({
                data : {
                    session : {
                        access_token : 'valid-refreshed-access-token',
                        refresh_token : 'valid-refreshed-refresh-token',
                    },
                },
                error : null,
            });

            const response = await request(app.getHttpServer())
                .post('/Auth/Refresh')
                .send({ refresh_token : validToken })
                .expect(201);

            expect(response.body).toEqual({
                access_token : 'valid-refreshed-access-token',
                refresh_token : 'valid-refreshed-refresh-token'
            });
        });
    });
});