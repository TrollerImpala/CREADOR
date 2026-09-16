import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';

export enum ArtRating {
  G = 'G',
  PG = 'PG',
  PG_13 = 'PG-13',
  R = 'R',
  NC = 'NC',
}

export class CreateArtPostDto {
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title!: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  description?: string;

  @IsArray({ message: 'Las etiquetas deben ser un arreglo de cadenas de texto' })
  @IsString({ each: true, message: 'Cada etiqueta debe ser un texto' })
  @IsOptional()
  tags?: string[];

  @IsEnum(ArtRating, { message: 'El rating debe ser un valor válido (G, PG, PG-13, R, NC)' })
  @IsNotEmpty({ message: 'El rating es obligatorio' })
  rating!: ArtRating;
}