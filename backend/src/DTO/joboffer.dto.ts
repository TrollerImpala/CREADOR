/**
 * joboffer.dto.ts — Validación de la creación de ofertas.
 *
 * Capa: DTO. El ValidationPipe global valida esta clase antes del controller.
 * Si un campo no está acá, se descarta del body por whitelist: true.
 */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsString, IsNotEmpty, IsOptional, IsArray, IsEmail } from 'class-validator';

import { Transform } from 'class-transformer';

export class CreateJobOfferPostDto {
  @ApiProperty({
    description: 'Título de la oferta de trabajo',
    example: 'Desarrollador Full Stack',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  project_title!: string;

  // Opcional: la oferta puede no tener descripción.
  @ApiPropertyOptional({
    description: 'Descripción de la oferta de trabajo',
    example: 'Buscamos un desarrollador con experiencia en Node.js y React.',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  project_info!: string;

  @ApiProperty({
    description: 'Correo electrónico de contacto',
    example: 'example@gmail.com',
  })
  @IsString({ message: 'El correo electrónico debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  /**
   * Tags: el frontend manda un string "react, node, arte" y @Transform lo
   * convierte en array antes de validar. Si ya viene array, lo deja igual.
   * Luego @IsArray + @IsString({ each: true }) validan cada elemento.
   */
  @ApiPropertyOptional({
    isArray: true,
    type: [String],
    description: 'Etiquetas de la oferta de trabajo',
    example: ['Node.js', 'React', 'Full Stack'],
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
}

export class EditJobOfferDto {
  @ApiProperty({
    description: 'ID de la oferta de trabajo',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString({ message: 'El ID de la oferta debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El ID de la oferta es obligatorio' })
  jobOffer_id!: string;

  @ApiProperty({
    description: 'Título de la oferta de trabajo',
    example: 'Desarrollador Full Stack Senior',
  })
  @IsString({ message: 'El título debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El título es obligatorio' })
  project_title!: string;

  @ApiPropertyOptional({
    description: 'Descripción de la oferta de trabajo',
    example: 'Descripción actualizada de la oferta',
  })
  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsOptional()
  project_info!: string;

  @ApiProperty({
    description: 'Correo electrónico de contacto',
    example: 'contacto@example.com',
  })
  @IsString({ message: 'El correo electrónico debe ser una cadena de texto' })
  @IsEmail({}, { message: 'El correo electrónico debe tener un formato válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email!: string;

  @ApiPropertyOptional({
    isArray: true,
    type: [String],
    description: 'Etiquetas de la oferta de trabajo',
    example: ['Node.js', 'React'],
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
}