/**
 * role.decorator.ts — Decorador @Roles(...).
 *
 * Capa: metadata. No ejecuta lógica por sí solo: guarda la lista de roles
 * requeridos para que RolesGuard la lea con Reflector.
 *
 * Ejemplo de uso:
 *   @Roles(Role.MODERATOR)
 *   @UseGuards(SupabaseAuthGuard, RolesGuard)
 *   @Delete(':id')
 *   eliminar(...) { ... }
 */
import { SetMetadata } from '@nestjs/common';
import { Role } from '../enum/roles.enum';

// SetMetadata('roles', role) escribe la metadata que busca RolesGuard.
export const Roles = (...role: Role[]) => SetMetadata('roles', role);
