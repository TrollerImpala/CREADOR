import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { SupabaseService } from '../src/sub_services/supabaseClient';

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

    // Paso 2 (Crear publicación usando `userAccessToken`), Paso 3 (Ver publicaciones), etc...
});