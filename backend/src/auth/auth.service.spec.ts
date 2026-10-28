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
        }
    }>
};

// suite de authservice
describe ('AuthService', () => {
    let authService : AuthService;
    let supabaseMock : MockSupabaseClient;

    // para querys de supabase
    const QueryMockBuilder = {
        select : jest.fn().mockReturnThis,
        eq : jest.fn().mockReturnThis,
        single : jest.fn(),
    };

    // reset antes de cada test
    beforeEach(async () => {
        supabaseMock = {
            getClient: jest.fn().mockReturnValue({
                from: jest.fn().mockReturnValue(QueryMockBuilder),
                auth: {
                refreshSession: jest.fn(),
                },
            }),
        };

        const module : TestingModule = await Test.createTestingModule({
            providers : [
                AuthService,
                {
                    provide : SupabaseService,
                    useValue : supabaseMock,
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

});