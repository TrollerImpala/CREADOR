/**
 * auth.controller.ts — Rutas HTTP de autenticación.
 *
 * Capa: controller (solo recibe HTTP y delega al service).
 * Base: /api/Auth por el prefijo global + @Controller('Auth').
 *
 * Endpoints:
 * - POST /api/Auth/Register → alta de usuario en Supabase Auth.
 * - POST /api/Auth/Login    → email + password, devuelve tokens y perfil.
 * - POST /api/Auth/Refresh  → renueva el access token con el refresh token.
 * - POST /api/Auth/LogOut   → cierra la sesión (requiere Bearer token).
 *
 * Las contraseñas NO se guardan en la tabla USERS: las maneja Supabase Auth
 * (auth.users). Por eso un "reset de contraseña" se implementa con los métodos
 * de Auth de Supabase, no con un UPDATE a USERS.
 */
import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import { SupabaseAuthGuard } from '../guards/auth.guard';

import {
  RegisterAuthDto,
  LoginAuthDto,
  RefreshTokenDto,
} from '../DTO/auth.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Alta: el body se valida contra RegisterAuthDto (email, password, tag, etc.).
  // El service llama a supabase.auth.signUp y devuelve el usuario creado.
  @Post('Register')
  async register(@Body() body: RegisterAuthDto) {
    return this.authService.register(body);
  }

  // Login: valida credenciales contra Supabase Auth.
  // Devuelve access token, refresh token, perfil público y rol.
  @Post('Login')
  async login(@Body() body: LoginAuthDto) {
    return this.authService.login(body);
  }

  // Refresh: el frontend lo llama cuando recibe 401 por token vencido.
  // Recibe el refresh token en el body (no en el header).
  @Post('Refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh_token(body.refresh_token);
  }

  // Logout: protegido por guard. Toma el token del header Authorization,
  // le quita el prefijo "Bearer " y lo pasa al service.
  @ApiOperation({ summary: 'Cerrar sesión de usuario' })
  @ApiBearerAuth()
  @UseGuards(SupabaseAuthGuard)
  @Post('LogOut')
  async log_out(@Headers('authorization') authHeader: string) {
    const token = authHeader?.replace('Bearer ', '').trim();
    return this.authService.log_out(token);
  }
}
