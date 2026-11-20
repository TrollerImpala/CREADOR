/**
 * art.dto.ts — Validación de la creación de arte.
 *
 * Capa: DTO.
 * Ojo: este DTO valida los campos de texto del multipart, pero NO el archivo
 * (art_img). El archivo lo recibe @UploadedFile() y el controller verifica
 * que exista. Por eso "art_img" no aparece como propiedad acá.
 *
 * El rating usa @IsEnum(Rating): solo acepta los valores del enum.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsEnum,
} from 'class-validator';

import { Transform } from 'class-transformer';

import { Rating } from '../enum/post-rating.enum';

export class CreateArtPostDto {
  @ApiProperty({
    description: 'Título del arte',
    example: 'Mi primera obra de arte',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title!: string;

  @ApiPropertyOptional({
    description: 'Descripción del arte',
    example: 'Una obra de arte hermosa y emotiva',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    isArray: true,
    type: [String],
    description: 'Etiquetas del arte',
    example: ['pintura', 'escultura'],
  })
  @Transform(({ value }: { value?: string | string[] }) =>
    typeof value === 'string'
      ? value.split(',').map((tag: string) => tag.trim())
      : value,
  )
  @IsArray({
    message: 'Las etiquetas deben ser un arreglo de cadenas de texto',
  })
  @IsString({ each: true, message: 'Cada etiqueta debe ser un texto' })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Rating del arte',
    example: Rating.G,
  })
  // @IsEnum valida que el valor pertenezca al enum Rating.
  // Es la forma correcta de validar un conjunto cerrado de opciones.
  @IsEnum(Rating, {
    message: 'El rating debe ser un valor válido (G, PG, PG-13, R, NC)',
  })
  @IsNotEmpty({ message: 'El rating es obligatorio' })
  rating!: Rating;
}

export class EditArtPostDto {
  @ApiProperty({
    description: 'ID del post de arte',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del post debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del post es obligatorio' })
  artpost_id!: string;

  @ApiProperty({
    description: 'Título del arte',
    example: 'Mi obra editada',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  title!: string;

  @ApiPropertyOptional({
    description: 'Descripción del arte',
    example: 'Una descripción actualizada',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    isArray: true,
    type: [String],
    description: 'Etiquetas del arte',
    example: ['pintura', 'digital'],
  })
  @Transform(({ value }: { value?: string | string[] }) =>
    typeof value === 'string'
      ? value.split(',').map((tag: string) => tag.trim())
      : value,
  )
  @IsArray({
    message: 'Las etiquetas deben ser un arreglo de cadenas de texto',
  })
  @IsString({ each: true, message: 'Cada etiqueta debe ser un texto' })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Rating del arte',
    example: Rating.G,
  })
  @IsEnum(Rating, {
    message: 'El rating debe ser un valor válido (G, PG, PG-13, R, NC)',
  })
  @IsNotEmpty({ message: 'El rating es obligatorio' })
  rating!: Rating;
}