/**
 * roles.guard.ts — Guard de autorización por rol.
 *
 * Capa: guard (se ejecuta después de SupabaseAuthGuard).
 *
 * Lee los roles requeridos que dejó el decorador @Roles(...) en la metadata
 * del handler o de la clase. Si el rol del usuario no está en esa lista,
 * corta con 401.
 *
 * IMPORTANTE (estado real del proyecto):
 * - Este guard está importado en art.controller.ts pero NO se aplica con
 *   @UseGuards en ninguna ruta.
 * - El enum Role solo tiene 'user' y 'moderator'; no existe 'admin'.
 * - Para usarlo hay que combinarlo:
 *     @UseGuards(SupabaseAuthGuard, RolesGuard)
 *     @Roles(Role.MODERATOR)
 *   y asegurarse de que el usuario tenga app_metadata.role = 'moderator'.
 */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enum/roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  // Reflector permite leer metadata declarada con decoradores (@Roles).
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Busca la metadata 'roles' en el método y en la clase.
    // getAllAndOverride prioriza el handler sobre la clase.
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sin @Roles(...) no hay restricción: la ruta pasa.
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    // req.user lo setea SupabaseAuthGuard. Si este guard corre solo,
    // user sería undefined y siempre daría error.
    const user = request.user;

    if (!user || !user.role) {
      throw new UnauthorizedException('User role not found');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new UnauthorizedException('User does not have the required role');
    }

    return true;
  }
}
