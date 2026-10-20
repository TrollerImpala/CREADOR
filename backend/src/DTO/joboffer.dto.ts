import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum } from 'class-validator';

import { Transform } from 'class-transformer';


export class CreateJobOfferPostDto {
    @ApiProperty({
        description: 'Título de la oferta de trabajo',
        example: 'Desarrollador Full Stack',
    })
    @IsString({ message: 'El título debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El título es obligatorio' })
    project_title!: string;

    @ApiPropertyOptional({
        description: 'Descripción de la oferta de trabajo',
        example: 'Buscamos un desarrollador con experiencia en Node.js y React.',
    })
    @IsString({ message: 'La descripción debe ser una cadena de texto' })
    @IsOptional()
    project_info!: string;

    @ApiProperty({
        description: 'Correo electrónico de contacto',
        example: 'example@gmail.com'
    })
    @IsString({ message: 'El correo electrónico debe ser una cadena de texto' })
    @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
    email!: string;

    @ApiPropertyOptional({
        isArray: true,
        type: [String],
        description: 'Etiquetas de la oferta de trabajo',
        example: ['Node.js', 'React', 'Full Stack'],
    })
    @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((tag: string) => tag.trim()) : value))
    @IsArray({ message: 'Las etiquetas deben ser un arreglo de cadenas de texto' })
    @IsString({ each: true, message: 'Cada etiqueta debe ser un texto' })
    @IsOptional()
    tags?: string[];
}