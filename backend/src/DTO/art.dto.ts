import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';

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
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((tag: string) => tag.trim()) : value))
  @IsArray({ message: 'Las etiquetas deben ser un arreglo de cadenas de texto' })
  @IsString({ each: true, message: 'Cada etiqueta debe ser un texto' })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: 'Rating del arte',
    example: Rating.G,
  })
  @IsEnum(Rating, { message: 'El rating debe ser un valor válido (G, PG, PG-13, R, NC)' })
  @IsNotEmpty({ message: 'El rating es obligatorio' })
  rating!: Rating;
}