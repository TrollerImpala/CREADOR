import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class RegisterAuthDto {
  @IsString({ message: 'El email debe ser una cadena de texto' })
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
  @IsString({ message: 'El email debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email! : string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password! : string;
}