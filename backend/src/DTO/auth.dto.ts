/**
 * auth.dto.ts — DTOs (Data Transfer Objects) de autenticación.
 *
 * Capa: validación de entrada.
 * Los decoradores de class-validator se ejecutan en el ValidationPipe global
 * (main.ts) antes de entrar al controller. Si algo falla, Nest responde 400.
 *
 * Recordá: el ValidationPipe tiene whitelist: true, así que cualquier campo
 * del body que no esté declarado acá se descarta en silencio.
 */
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEmail,
} from 'class-validator';

export class RegisterAuthDto {
  // @IsEmail valida formato; @IsNotEmpty evita cadena vacía.
  @IsEmail()
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;

  @IsString({ message: 'El tag debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tag es obligatorio' })
  userTag!: string;

  @IsString({ message: 'El nombre tiene que ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  userName!: string;

  // El signo ? indica opcional en TypeScript; @IsOptional lo permite en runtime.
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  userDescription?: string;

  // Debe ser un array de strings (URLs de redes sociales).
  @IsArray({ message: 'Las redes deben ser un Array de Urls' })
  @IsOptional()
  socialMedias?: string[];
}

export class LoginAuthDto {
  @IsEmail()
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password!: string;
}

export class RefreshTokenDto {
  // El refresh token viaja en el body de POST /api/Auth/Refresh.
  @IsString({ message: 'El refresh token debe ser un string' })
  @IsNotEmpty({ message: 'El refresh token es obligatorio' })
  refresh_token!: string;
}
