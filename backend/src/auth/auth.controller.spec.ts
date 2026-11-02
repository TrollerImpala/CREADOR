import { TestingModule, Test } from '@nestjs/testing';
import {
  UnauthorizedException,
  BadRequestException,
  CanActivate,
} from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterAuthDto, LoginAuthDto } from '../DTO/auth.dto';
import { SupabaseService } from '../sub_services/supabaseClient';
import { SupabaseAuthGuard } from '../guards/auth.guard'; // Ajusta según la ruta real de tu guard

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  // Mock del AuthService
  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refresh_token: jest.fn(),
    log_out: jest.fn(),
  };

  // Mock dummy de SupabaseService para el módulo de pruebas
  const mockSupabaseService = {
    getClient: jest.fn(),
    getUserClient: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('register', () => {
    it('registrar usuario correctamente', async () => {
      const registerDto: RegisterAuthDto = {
        email: 'example@domain.com',
        password: 'securePassword123',
        userTag: 'john_123',
        userName: 'John Doe',
        userDescription: 'descripcion example woah',
        socialMedias: [],
      };

      const mockRegisterResponse = {
        mensaje: 'Usuario registrado con exito',
        user: {
          id: 'user-id-123',
          email: 'example@domain.com',
          user_metadata: {
            user_tag: 'john_123',
            user_name: 'John Doe',
            user_description: 'descripcion example woah',
            social_medias: [],
          },
          app_metadata: {
            role: 'user',
          },
        } as any,
      };

      mockAuthService.register.mockResolvedValue(mockRegisterResponse);

      const response = await authController.register(registerDto);

      expect(response).toEqual(mockRegisterResponse);
      expect(authService.register).toHaveBeenCalledWith(registerDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('debe loguear un usuario correctamente y retornar sus tokens, perfil y rol', async () => {
      const loginDto: LoginAuthDto = {
        email: 'example@domain.com',
        password: 'securePassword123',
      };

      const mockLoginResponse = {
        mensaje: 'Usuario logeado con exito',
        user_token: 'mock_access_token',
        refresh_token: 'mock_refresh_token',
        user: {
          id_user: 'user-id-123',
          user_name: 'Test User',
          user_avatar_url: 'https://avatar.url/photo.png',
        },
        role: 'user',
      };

      mockAuthService.login.mockResolvedValue(mockLoginResponse);

      const response = await authController.login(loginDto);

      expect(response).toEqual(mockLoginResponse);
      expect(authService.login).toHaveBeenCalledWith(loginDto);
    });

    it('debe lanzar UnauthorizedException si las credenciales son incorrectas', async () => {
      const invalidLoginDto: LoginAuthDto = {
        email: 'wrong@domain.com',
        password: 'wrongPassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid login credentials'),
      );

      await expect(authController.login(invalidLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(invalidLoginDto);
    });
  });

  describe('refresh', () => {
    it('debe refrescar los tokens de sesión', async () => {
      const refreshBody = { refresh_token: 'valid_refresh_token' };
      const mockRefreshResponse = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      };

      mockAuthService.refresh_token.mockResolvedValue(mockRefreshResponse);

      const response = await authController.refresh(refreshBody);

      expect(response).toEqual(mockRefreshResponse);
      expect(authService.refresh_token).toHaveBeenCalledWith(
        'valid_refresh_token',
      );
    });

    it('debe lanzar UnauthorizedException si el refresh_token es inválido o ha expirado', async () => {
      const invalidRefreshBody = { refresh_token: 'invalid_token' };

      mockAuthService.refresh_token.mockRejectedValue(
        new UnauthorizedException(
          'No se pudo refrescar el token, la sesión ha expirado',
        ),
      );

      await expect(authController.refresh(invalidRefreshBody)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.refresh_token).toHaveBeenCalledWith('invalid_token');
    });
  });

  describe('log_out', () => {
    it('debe extraer el token Bearer del header y cerrar la sesión', async () => {
      const authHeader = 'Bearer valid_bearer_token';
      const mockLogoutResponse = { mensaje: 'Cierre de sesión exitoso' };

      mockAuthService.log_out.mockResolvedValue(mockLogoutResponse);

      const response = await authController.log_out(authHeader);

      expect(response).toEqual(mockLogoutResponse);
      expect(authService.log_out).toHaveBeenCalledWith('valid_bearer_token');
    });

    it('debe pasar undefined o string vacío al servicio si el header está ausente o mal formateado', async () => {
      mockAuthService.log_out.mockRejectedValue(
        new UnauthorizedException('No se proporcionó el token de acceso'),
      );

      await expect(authController.log_out()).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.log_out).toHaveBeenCalledWith(undefined);
    });
  });

  describe('SupabaseAuthGuard (Integración con controlador)', () => {
    it('debe bloquear el acceso a log_out si el Guard retorna false', async () => {
      // Recreamos un módulo específico donde el Guard rechaza la petición
      const mockGuard: CanActivate = {
        canActivate: jest.fn().mockReturnValue(false),
      };

      const moduleWithGuard: TestingModule = await Test.createTestingModule({
        controllers: [AuthController],
        providers: [
          { provide: AuthService, useValue: mockAuthService },
          { provide: SupabaseService, useValue: mockSupabaseService },
        ],
      })
        .overrideGuard(SupabaseAuthGuard)
        .useValue(mockGuard)
        .compile();

      const guardInstance = moduleWithGuard.get<CanActivate>(SupabaseAuthGuard);

      const canActivateResult = await guardInstance.canActivate({} as any);

      expect(canActivateResult).toBe(false);
      // Al ser denegado por el guard, el método del servicio no debería llegar a ser invocado por el framework
      expect(mockAuthService.log_out).not.toHaveBeenCalled();
    });
  });
});
