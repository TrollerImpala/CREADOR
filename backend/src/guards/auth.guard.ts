/**
 * auth.guard.ts — Guard de autenticación con Supabase.
 *
 * Capa: guard (se ejecuta antes del controller).
 *
 * Qué hace:
 * 1. Extrae el token del header Authorization: Bearer <token>
 *    (o de una cookie access_token si existiera).
 * 2. Lo valida contra Supabase Auth con auth.getUser(token).
 * 3. Si es válido, adjunta req.user = { id, email, role }.
 * 4. Si falta o es inválido, corta con 401 antes de entrar al controller.
 *
 * Uso: @UseGuards(SupabaseAuthGuard) en cualquier ruta protegida.
 * Sin este guard, el controller no sabe quién es el usuario.
 */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../sub_services/supabaseClient';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly supabase: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    // Cliente con la clave anon: solo sirve para validar el token recibido.
    this.supabase = this.supabaseService.getClient();
  }

  /**
   * Nest llama a este método en cada request de una ruta protegida.
   * Devolver true permite continuar; lanzar una excepción corta el flujo.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // context.switchToHttp() da acceso al request/response de Express.
    const request = context.switchToHttp().getRequest();

    // Obtener token: primero cookie, luego header "Bearer <token>".
    // split(' ')[1] toma lo que está después de "Bearer".
    const token =
      request.cookies?.access_token ||
      request.headers.authorization?.split(' ')[1];

    if (!token) {
      // 401: no hay credenciales. Es distinto de 403 (hay credenciales
      // pero no alcanzan los permisos).
      throw new UnauthorizedException('No se proporcionó token de sesión');
    }

    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token); // Validar token

    if (error || !user) {
      // Token vencido, falsificado o de otra sesión.
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Datos disponibles en los controllers como @Req() req.user.
    // El rol se lee de app_metadata (lo controla el administrador),
    // no de user_metadata (que el propio usuario podría editar).
    request.user = {
      id: user.id,
      email: user.email,
      role: user.app_metadata?.role || 'user',
    }; // Para uso de controladores

    return true;
  }
}
