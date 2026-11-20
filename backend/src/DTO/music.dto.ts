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

export class CreateMusicPostDto {
  @ApiProperty({
    description: 'Nombre de la canción',
    example: 'Mi primera canción',
  })
  @IsString({ message: 'El nombre de la canción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la canción es obligatorio' })
  song_name!: string;

  @ApiProperty({
    description: 'Descripción de la canción',
    example: 'Una canción hermosa y emotiva',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  song_description?: string;

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
    description: 'Rating de la canción',
    example: Rating.G,
  })
  @IsEnum(Rating, {
    message: 'El rating debe ser un valor válido (G, PG, PG-13, R, NC)',
  })
  @IsNotEmpty({ message: 'El rating es obligatorio' })
  rating!: Rating;
}

export class EditMusicPostDto {
  @ApiProperty({
    description: 'ID del post de música',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID del post debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID del post es obligatorio' })
  song_id!: string;

  @ApiProperty({
    description: 'Nombre de la canción',
    example: 'Mi canción editada',
  })
  @IsString({ message: 'El nombre de la canción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre de la canción es obligatorio' })
  song_name!: string;

  @ApiPropertyOptional({
    description: 'Descripción de la canción',
    example: 'Una descripción actualizada',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  song_description?: string;

  @ApiPropertyOptional({
    description: 'URL de la portada de la canción',
    example: 'https://example.com/covers/song.jpg',
  })
  @IsString({ message: 'La URL de la portada debe ser una cadena de texto' })
  @IsOptional()
  song_cover_url?: string;

  @ApiPropertyOptional({
    isArray: true,
    type: [String],
    description: 'Etiquetas de la canción',
    example: ['rock', 'alternativo'],
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
    description: 'Rating de la canción',
    example: Rating.G,
  })
  @IsEnum(Rating, {
    message: 'El rating debe ser un valor válido (G, PG, PG-13, R, NC)',
  })
  @IsNotEmpty({ message: 'El rating es obligatorio' })
  rating!: Rating;
}