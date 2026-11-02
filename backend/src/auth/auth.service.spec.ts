import { TestingModule, Test } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../sub_services/supabaseClient';
import { AuthService } from './auth.service';

// mock para cliente de supabase (el auth)
type MockSupabaseClient = {
    getClient : jest.Mock<{
        from : jest.Mock;
        auth : {
            refreshSession : jest.Mock;
            signOut : jest.Mock;
            signUp : jest.Mock;
            signInWithPassword: jest.Mock;            
        }
    }>;
    getUserClient : jest.Mock<{
        from : jest.Mock;
        auth : {
            refreshSession : jest.Mock;
            signOut : jest.Mock;
        }
    }>
};

// suite de authservice
describe ('AuthService', () => {
    let authService : AuthService;
    let supabaseMock : MockSupabaseClient;

    // para querys de supabase
    const QueryMockBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        single: jest.fn(),
    };

    // reset antes de cada test
    beforeEach(async () => {
        supabaseMock = {
            getClient: jest.fn().mockReturnValue({
                from: jest.fn().mockReturnValue(QueryMockBuilder),
                auth: {
                    signUp: jest.fn(),
                    signInWithPassword: jest.fn(),
                    refreshSession: jest.fn(),
                    signOut: jest.fn(),
                },
            }),
            getUserClient: jest.fn().mockReturnValue({
                from: jest.fn().mockReturnValue(QueryMockBuilder),
                auth: {
                    refreshSession: jest.fn(),
                    signOut: jest.fn(),
                },
            }),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: SupabaseService,
                    useValue: supabaseMock,
                },
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
    });

    it('authService definido', () => {
        expect(authService).toBeDefined();
    });

    describe('refresh de sesion', () => {
        it('retornar tokens nuevos al usar refresh_token con refresh token valido', async () => {
            const mockedRefreshToken = 'valid_refresh_token';
            
            //mock de respuesta esperada
            const mockedResponse = {
                data : {
                    session : {
                        access_token : 'new_access_token',
                        refresh_token : 'new_refresh_token',
                    },
                },
                error : null,
            };

            //hacer que el refresh del mock tenga esta respuesta
            const client = supabaseMock.getClient();

            client.auth.refreshSession.mockResolvedValue(mockedResponse);
        
            const response = await authService.refresh_token(mockedRefreshToken);
            expect(response)
                .toEqual({
                    access_token : 'new_access_token',
                    refresh_token : 'new_refresh_token',
                });

            expect(client.auth.refreshSession)
                .toHaveBeenCalledWith({refresh_token : mockedRefreshToken});
            
            expect(client.auth.refreshSession)
                .toHaveBeenCalledTimes(1);
        });
        
        it('debe lanzar UnauthorizedException si Supabase devuelve un error al usar un refresh token invalido', async () => {
            
            const client = supabaseMock.getClient();

            client.auth.refreshSession.mockResolvedValue({
                data: { session: null },
                error: { message: 'Invalid refresh token' },
            });

            await expect(authService.refresh_token('invalid_token'),)
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe('Cerrar sesion', () => {
        it('Devolver mensaje de exito al hacer logOut con un token valido', async () => {
            const mockedToken = 'valid_token';
                
            const mockUserClient = {
                auth: {
                    signOut: jest.fn().mockResolvedValue({ error: null })
                }
            };
            
            supabaseMock.getUserClient = jest.fn().mockReturnValue(mockUserClient);
            
            const response = await authService.log_out(mockedToken);

            expect(response)
                .toEqual({
                    mensaje : 'Cierre de sesión exitoso'
                });

            expect(supabaseMock.getUserClient)
                .toHaveBeenCalledWith('valid_token');

            expect(mockUserClient.auth.signOut)
                .toHaveBeenCalledTimes(1);
        });

        it('Dar error al hacer logout con token invalido', async () => {
            const mockedResponse = {
                error : {
                    message : 'Invalid or expired token'
                }
            };

            const mockUserClient = {
                auth: {
                    signOut: jest.fn().mockResolvedValue(mockedResponse)
                }
            };
            
            supabaseMock.getUserClient = jest.fn().mockReturnValue(mockUserClient);
            
            await expect(authService.log_out('invalid_token'))
                .rejects.toThrow(UnauthorizedException);
        });
        
        it('Dar error al hacer logout sin token', async () => {
            const mockedResponse = {
                error : {
                    message : 'No token provided'
                }
            };

            const client = supabaseMock.getClient();

            client.auth.signOut.mockResolvedValue(mockedResponse);

            await expect(authService.log_out())
                .rejects.toThrow(UnauthorizedException);
        });
    });

    describe('register', () => {
        it('debe registrar un usuario exitosamente con datos completos', async () => {
            const registerDto = {
                email: 'test@example.com',
                password: 'password123',
                userTag: 'testtag',
                userName: 'Test User',
                userDescription: 'Hola mundo',
                socialMedias: [],
            };

            const mockUser = { id: 'user-id-123', email: 'test@example.com' };

            const client = supabaseMock.getClient();
            client.auth.signUp.mockResolvedValue({
                data: { user: mockUser },
                error: null,
            });

            const response = await authService.register(registerDto);

            expect(response).toEqual({
                mensaje: 'Usuario registrado con exito',
                user: mockUser,
            });

            expect(client.auth.signUp).toHaveBeenCalledWith({
                email: registerDto.email,
                password: registerDto.password,
                options: {
                    data: {
                        user_tag: registerDto.userTag,
                        user_name: registerDto.userName,
                        user_description: registerDto.userDescription,
                        social_medias: registerDto.socialMedias,
                    },
                },
            });
            expect(client.auth.signUp).toHaveBeenCalledTimes(1);
        });

        it('debe asignar valores por defecto a user_description y social_medias si no se proveen', async () => {
            const registerDto = {
                email: 'test@example.com',
                password: 'password123',
                userTag: 'testtag',
                userName: 'Test User',
            };

            const client = supabaseMock.getClient();
            client.auth.signUp.mockResolvedValue({
                data: { user: { id: 'user-id-123' } },
                error: null,
            });

            await authService.register(registerDto);

            expect(client.auth.signUp).toHaveBeenCalledWith({
                email: registerDto.email,
                password: registerDto.password,
                options: {
                    data: {
                        user_tag: registerDto.userTag,
                        user_name: registerDto.userName,
                        user_description: '',
                        social_medias: [],
                    },
                },
            });
        });

        it('debe lanzar BadRequestException si Supabase devuelve un error en signUp', async () => {
            const registerDto = {
                email: 'test@example.com',
                password: 'password123',
                userTag: 'testtag',
                userName: 'Test User',
            };

            const client = supabaseMock.getClient();
            client.auth.signUp.mockResolvedValue({
                data: { user: null },
                error: { message: 'El email ya está registrado' },
            });

            await expect(authService.register(registerDto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('login', () => {
        it('debe loguear un usuario correctamente y retornar sus tokens y perfil', async () => {
            const loginDto = {
                email: 'test@example.com',
                password: 'password123',
            };

            const mockSessionData = {
                user: { id: 'user-id-123' },
                session: {
                    access_token: 'mock_access_token',
                    refresh_token: 'mock_refresh_token',
                },
            };

            const mockProfile = {
                user_name: 'Test User',
                user_avatar_url: 'https://avatar.url/photo.png',
            };

            const client = supabaseMock.getClient();
            client.auth.signInWithPassword.mockResolvedValue({
                data: mockSessionData,
                error: null,
            });

            // Configuramos la respuesta encadenada de .from('USERS').select().eq().single()
            QueryMockBuilder.single.mockResolvedValue({
                data: mockProfile,
                error: null,
            });

            const response = await authService.login(loginDto);

            expect(response).toEqual({
                mensaje: 'Usuario logeado con exito',
                user_token: 'mock_access_token',
                refresh_token: 'mock_refresh_token',
                user: mockProfile,
            });

            expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
                email: loginDto.email,
                password: loginDto.password,
            });
            expect(client.from).toHaveBeenCalledWith('USERS');
            expect(QueryMockBuilder.eq).toHaveBeenCalledWith('id_user', 'user-id-123');
            expect(QueryMockBuilder.single).toHaveBeenCalledTimes(1);
        });

        it('debe lanzar UnauthorizedException si las credenciales de login son incorrectas', async () => {
            const loginDto = {
                email: 'wrong@example.com',
                password: 'wrongpassword',
            };

            const client = supabaseMock.getClient();
            client.auth.signInWithPassword.mockResolvedValue({
                data: { user: null, session: null },
                error: { message: 'Invalid login credentials' },
            });

            await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });
    });

});