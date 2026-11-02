import { SupabaseAuthGuard } from "./auth.guard";
import { SupabaseService } from "../sub_services/supabaseClient";
import { ExecutionContext, UnauthorizedException } from "@nestjs/common";

describe('SupabaseAuthGuard', () => {
    let guard: SupabaseAuthGuard;
    let mockSupabaseClient: any;
    let supabaseServiceMock: any;
    let mockExecutionContext: Partial<ExecutionContext>;

    beforeEach(() => {
        // 1. Instancia del cliente de Supabase mockeado
        mockSupabaseClient = {
            auth: {
                getUser: jest.fn(),
            },
        };

        // 2. Inyectamos getClient() para que coincida con constructor del Guard
        supabaseServiceMock = {
            getClient: jest.fn().mockReturnValue(mockSupabaseClient),
        };

        guard = new SupabaseAuthGuard(supabaseServiceMock as SupabaseService);
    });

    it('debe estar definido', () => {
        expect(guard).toBeDefined();
    });

    it('Dejar pasar si el token del usuario es valido', async () => {
        const mockUser = {
            id: 'user-uuid',
            email: 'example@domain.com',
            app_metadata: { role: 'user' },
        };

        // Configuramos la respuesta esperada de getUser
        mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: mockUser },
            error: null,
        });

        // Simulamos el objeto request de Express/NestJS (headers en minúsculas)
        const mockRequest: any = {
            headers: {
                authorization: 'Bearer valid-token',
            },
        };

        mockExecutionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: () => mockRequest,
            }),
        };

        const result = await guard.canActivate(mockExecutionContext as ExecutionContext);

        expect(result).toBe(true);

        // Verificamos que el Guard haya adjuntado el usuario al request
        expect(mockRequest.user).toEqual({
            id: 'user-uuid',
            email: 'example@domain.com',
            role: 'user',
        });

        // Verificamos la llamada del cliente pasando el token extraído
        expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledWith('valid-token');
        expect(mockSupabaseClient.auth.getUser).toHaveBeenCalledTimes(1);
    });

    it('Debe lanzar UnauthorizedException si no se envía token', async () => {
        const mockRequest: any = {
            headers: {},
        };

        mockExecutionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: () => mockRequest,
            }),
        };

        await expect(guard.canActivate(mockExecutionContext as ExecutionContext))
            .rejects.toThrow(UnauthorizedException);
    });

    it('Debe lanzar UnauthorizedException si Supabase devuelve un token inválido', async () => {
        mockSupabaseClient.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: { message: 'Token de acceso inválido' },
        });

        const mockRequest: any = {
            headers: {
                authorization: 'Bearer invalid-token',
            },
        };

        mockExecutionContext = {
            switchToHttp: jest.fn().mockReturnValue({
                getRequest: () => mockRequest,
            }),
        };

        await expect(guard.canActivate(mockExecutionContext as ExecutionContext))
            .rejects.toThrow(UnauthorizedException);
    });
});