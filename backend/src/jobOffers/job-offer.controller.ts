/**
 * job-offer.controller.ts — Rutas HTTP de ofertas de trabajo.
 *
 * Capa: controller. Este módulo es el CRUD más limpio del proyecto y sirve
 * como plantilla para crear cualquier módulo nuevo.
 *
 * Base: /api/JobOffer (prefijo global /api + @Controller('JobOffer')).
 *
 * Endpoints:
 * - GET  /api/JobOffer/JobOfferPosts?from=0&limit=10  → lista paginada
 * - GET  /api/JobOffer/UserJobOfferPosts/:id          → ofertas de un usuario
 * - GET  /api/JobOffer/JobOfferPost/:id               → detalle con autor
 * - POST /api/JobOffer/PostJobOffer                   → crear (requiere token)
 *
 * El borrado NO está acá: se hace por DELETE /api/GeneralPosts/Deleteposts/:id
 * con tipo=JobOfferta (ver general_posts.service.ts).
 */
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';

import { SupabaseAuthGuard } from '../guards/auth.guard';

import { JobOfferService } from './job-offer.service';

import { CreateJobOfferPostDto, EditJobOfferDto } from '../DTO/joboffer.dto';

import { UploadedFileDto } from '../DTO/file.dto';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Job Offer Posts')
@Controller('JobOffer')
export class JobOfferController {
  constructor(private readonly jobOfferService: JobOfferService) {}

  @ApiOperation({
    summary: 'Obtener todas las publicaciones de ofertas de trabajo',
  })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todas las publicaciones de ofertas de trabajo',
  })
  // Lista paginada. from y limit llegan como query params y Nest los recibe
  // como string en runtime, pero el service los usa en .range() igual.
  // La ruta es pública: el guard está comentado a propósito.
  @Get('JobOfferPosts')
  //@UseGuards(SupabaseAuthGuard)
  async getJobOfferPosts(
    @Query('from') from: number,
    @Query('limit') limit: number,
  ) {
    return await this.jobOfferService.getJobOfferPosts(from, limit);
  }

  // Ofertas de un usuario concreto. :id es el id_user de USERS/auth.users.
  @Get('UserJobOfferPosts/:id')
  async getUserMusicPosts(
    @Param('id') user_id: string,
    @Query('from') from: number,
    @Query('limit') limit: number,
  ) {
    return await this.jobOfferService.getUserJobOfferPosts(
      user_id,
      from,
      limit,
    );
  }

  // Detalle por project_id. El service trae también los datos del autor
  // mediante la relación con USERS.
  @ApiOperation({
    summary: 'Obtener una publicación de oferta de trabajo específica',
  })
  @ApiResponse({
    status: 200,
    description: 'Devuelve la publicación de oferta de trabajo solicitada',
  })
  @Get('JobOfferPost/:id')
  async getJobOfferPost(@Param('id') id: string) {
    return await this.jobOfferService.getJobOfferPost(id);
  }

  // Crear oferta: ruta protegida. El guard valida el Bearer token y deja
  // req.user; el controller solo toma el id y delega. El body se valida
  // contra CreateJobOfferPostDto antes de entrar acá.
  @ApiOperation({ summary: 'Crear una nueva publicación de oferta de trabajo' })
  @ApiResponse({
    status: 201,
    description: 'Devuelve la publicación de oferta de trabajo creada',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        project_title: { type: 'string', example: 'La aventura de Pepe' },
        project_info: { type: 'string', example: 'Detalles sobre la oferta' },
        email: { type: 'string', example: 'example@gmail.com' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['programacion', 'arte'],
        },
      },
    },
  })
  @ApiBearerAuth()
  @Post('PostJobOffer')
  @UseGuards(SupabaseAuthGuard)
  async postJobOffer(@Req() req: any, @Body() body: CreateJobOfferPostDto) {
    // req.user.id lo setea SupabaseAuthGuard tras validar el token.
    const user_id = req.user.id;
    return await this.jobOfferService.postJobOffer(user_id, body);
  }

  @ApiOperation({ summary: 'Editar una publicación de oferta de trabajo' })
  @ApiBearerAuth()
  @ApiBody({ type: EditJobOfferDto })
  @ApiResponse({
    status: 200,
    description: 'Oferta de trabajo actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no es propietario del post',
  })
  @Put('EditJobOffer')
  @UseGuards(SupabaseAuthGuard)
  async editJobOffer(
    @Req() req: any,
    @Body() body: EditJobOfferDto,
  ) {
    const currentUser_id = req.user.id;
    return await this.jobOfferService.editJobOfferPost(body, currentUser_id);
  }
}
