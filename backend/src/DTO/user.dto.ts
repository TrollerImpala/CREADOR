import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, isString } from 'class-validator';

export class UserDto {
  @IsString({ message: 'El tag debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El tag es obligatorio' })
  userTag! : string;

  @IsString({ message : 'El nombre tiene que ser una cadena de texto' })
  @IsNotEmpty({ message : 'El nombre es obligatorio' })
  userName! : string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  userDescription?: string;

  @IsString({ message : 'El avatar tiene que ser una cadena de texto Url' })
  @IsNotEmpty({ message : 'La foto de perfil es obligatoria' })
  avatarUrl! : string;

  @IsArray({ message : 'Las redes deben ser un Array de Urls' })
  @IsOptional()
  socialMedias ?: string[];
}