/**
 * post-rating.enum.ts — Clasificación por edades de las publicaciones.
 *
 * Capa: dominio.
 * @IsEnum(Rating) en los DTO acepta solo estos valores.
 * PG_13 se serializa como 'PG-13' (el guion no es válido en un identificador).
 */
export enum Rating {
  G = 'G',
  PG = 'PG',
  PG_13 = 'PG-13',
  R = 'R',
  NC = 'NC',
}
