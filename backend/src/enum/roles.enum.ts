/**
 * roles.enum.ts — Roles disponibles en el sistema.
 *
 * Capa: dominio.
 * Hoy solo existen 'user' y 'moderator'. No hay 'admin'.
 * El rol se guarda en app_metadata del usuario en Supabase Auth.
 *
 * Ojo: RolesGuard existe pero no está aplicado en ningún controller.
 */
export enum Role {
  USER = 'user',
  MODERATOR = 'moderator',
}
