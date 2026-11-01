import { IsString, IsNotEmpty, IsOptional, IsArray, isEmail, IsEmail } from 'class-validator';

export class RegisterAuthDto {
  @IsEmail()
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email! : string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password! : string;

  @IsString({ message: 'El tag debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tag es obligatorio' })
  userTag! : string;

  @IsString({ message : 'El nombre tiene que ser una cadena de texto' })
  @IsNotEmpty({ message : 'El nombre es obligatorio' })
  userName! : string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  userDescription?: string;

  @IsArray({ message : 'Las redes deben ser un Array de Urls' })
  @IsOptional()
  socialMedias ?: string[];
}

export class LoginAuthDto {
  @IsEmail()
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email! : string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password! : string;
}

export class RefreshTokenDto {
  @IsString({ message: 'El refresh token debe ser un string' })
  @IsNotEmpty({ message: 'El refresh token es obligatorio' })
  refresh_token!: string;
}