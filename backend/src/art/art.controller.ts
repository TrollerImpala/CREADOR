/**
 * art.controller.ts — Rutas HTTP de publicaciones de arte.
 *
 * Capa: controller.
 * Base: /api/Art.
 *
 * Este controller es el ejemplo de subida de archivos (multipart/form-data):
 * - FileInterceptor('art_img') procesa el archivo.
 * - @UploadedFile() lo recibe como Express.Multer.File.
 * - El service lo sube a Storage y guarda la URL en ARTPOSTS.
 *
 * Nota: RolesGuard está importado en este archivo pero no se aplica en
 * ninguna ruta; hoy el arte lo puede crear cualquier usuario autenticado.
 */
import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';

import { Roles } from '../decorators/role.decorator';
import { Role } from '../enum/roles.enum';

import 'multer';

import { FileInterceptor } from '@nestjs/platform-express';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { SupabaseAuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';

import { ArtService } from './art.service';

import { CreateArtPostDto } from '../DTO/art.dto';
//import type { UploadedFileDto } from "../DTO/file.dto";

@ApiTags('Art Posts')
@Controller('Art')
export class ArtController {
  constructor(private readonly artService: ArtService) {}

  @ApiOperation({ summary: 'Obtener todas las publicaciones de arte' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todas las publicaciones de arte',
  })
  // Lista pública de arte (paginada). El guard está comentado a propósito.
  @Get('ArtPosts')
  //@UseGuards(SupabaseAuthGuard)
  async getArtPosts(
    @Query('from') from: number,
    @Query('limit') limit: number,
  ) {
    return await this.artService.getArtPosts(from, limit);
  }

  // Obras de un usuario concreto, para su perfil.
  @Get('UserArtPosts/:id')
  async getUserArtPosts(
    @Param('id') user_id: string,
    @Query('from') from: number,
    @Query('limit') limit: number,
  ) {
    return await this.artService.getUserArtPosts(user_id, from, limit);
  }

  // Detalle de una obra (incluye datos del autor).
  @ApiOperation({ summary: 'Obtener una publicación de arte específica' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve la publicación de arte solicitada',
  })
  @Get('ArtPost/:id')
  async getArtPost(@Param('id') id: string) {
    return await this.artService.getArtPost(id);
  }

  // Crear obra: ruta protegida + archivo obligatorio.
  // @ApiConsumes/@ApiBody solo documentan el multipart en Swagger.
  // El DTO valida los campos de texto; el archivo se valida acá a mano.
  @ApiOperation({ summary: 'Crear una nueva publicación de arte' })
  @ApiResponse({
    status: 201,
    description: 'Publicación de arte creada exitosamente',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string', example: 'Ilustración Gothic' },
        art_img: { type: 'string', format: 'binary' },
        description: { type: 'string', example: 'Detalles sobre la obra' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['gothic', 'digital'],
        },
        rating: { type: 'string', example: 'G' },
      },
    },
  })
  @ApiBearerAuth()
  @Post('PostArt')
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(FileInterceptor('art_img'))
  async createArtPost(
    @Req() req: any,
    @Body() body: CreateArtPostDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Si no vino archivo, no se puede crear la publicación.
    if (!file) {
      throw new BadRequestException('El archivo de imagen es obligatorio');
    }

    // El autor sale del token, nunca del body.
    const userId = req.user.id;

    console.log(body);
    console.log(file);

    // Se arma el payload que espera el service: campos + archivo.
    const postPayload = {
      title: body.title,
      description: body.description,
      tags: body.tags,
      rating: body.rating,
      art_img: file,
    };

    return this.artService.postArt(userId, postPayload);
  }
}
