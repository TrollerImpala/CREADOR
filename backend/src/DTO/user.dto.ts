/**
 * user.dto.ts — Validación de la actualización de perfil.
 *
 * Capa: DTO.
 * Se usa en PUT /api/Users/ActualizarPerfil. El avatar NO está acá porque
 * viaja como archivo multipart y lo recibe @UploadedFile().
 */
import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class UserDto {
  @IsString({ message: 'El tag debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tag es obligatorio' })
  userTag!: string;

  @IsString({ message: 'El nombre tiene que ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  userName!: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  userDescription?: string;

  @IsArray({ message: 'Las redes deben ser un Array de Urls' })
  @IsOptional()
  socialMedias?: string[];
}
