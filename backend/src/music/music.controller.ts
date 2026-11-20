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
  BadRequestException,
  UploadedFiles,
  HttpStatus,
  ParseFilePipeBuilder,
  UploadedFile,
} from '@nestjs/common';

import 'multer';

import {
  FileFieldsInterceptor,
} from '@nestjs/platform-express';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { SupabaseAuthGuard } from '../guards/auth.guard';
import { MusicService } from './music.service';
import { CreateMusicPostDto, EditMusicPostDto } from '../DTO/music.dto';
import multer from 'multer';

@ApiTags('Music Posts')
@Controller('Music')
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @ApiOperation({ summary: 'Obtener todas las publicaciones de música' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve todas las publicaciones de música',
  })
  @Get('MusicPosts')
  async getMusicPosts(
    @Query('from') from: number,
    @Query('limit') limit: number,
  ) {
    return await this.musicService.getMusicPosts(from, limit);
  }

  @Get('UserMusicPosts/:id')
  async getUserMusicPosts(
    @Param('id') user_id: string,
    @Query('from') from: number,
    @Query('limit') limit: number,
  ) {
    return await this.musicService.getUserMusicPosts(user_id, from, limit);
  }

  @ApiOperation({ summary: 'Obtener una publicación de música específica' })
  @ApiResponse({
    status: 200,
    description: 'Devuelve la publicación de música solicitada',
  })
  @Get('MusicPost/:id')
  async getMusicPost(@Param('id') id: string) {
    return await this.musicService.getMusicPost(id);
  }

  @ApiOperation({ summary: 'Crear una nueva publicación de música' })
  @ApiResponse({
    status: 201,
    description: 'Publicación de música creada exitosamente',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        song_name: { type: 'string', example: 'Mi primera canción' },
        song_file: { type: 'string', format: 'binary' },
        song_cover_img: { type: 'string', format: 'binary' },
        song_description: {
          type: 'string',
          example: 'Una canción hermosa y emotiva',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['rock', 'pop'],
        },
        rating: { type: 'string', example: 'G' },
      },
    },
  })
  @ApiBearerAuth()
  @Post('PostMusic')
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'song_file', maxCount: 1 },
      { name: 'song_cover_img', maxCount: 1 },
    ]),
  )
  async postSong(
    @Req() req: any,
    @Body() body: CreateMusicPostDto,
    @UploadedFiles()
    files: {
      song_file: Express.Multer.File[];
      song_cover_img: Express.Multer.File[];
    },
  ) {
    // Validación segura para detectar arrays vacíos o indefinidos de Multer
    if (!files?.song_file?.[0] || !files?.song_cover_img?.[0]) {
      throw new BadRequestException(
        'El archivo de música y la imagen de portada son obligatorios',
      );
    }

    const user_id = req.user.id;

    const coverPipe = new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: 'image/(jpg|jpeg|png|gif|pdf)',
        skipMagicNumbersValidation: process.env.NODE_ENV === 'test',
      })
      .build({
        fileIsRequired: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });

    const songPipe = new ParseFilePipeBuilder()
      .addFileTypeValidator({
        fileType: 'audio/(mp3|wav|ogg|flac|mpeg)',
        skipMagicNumbersValidation: process.env.NODE_ENV === 'test',
      })
      .build({
        fileIsRequired: true,
        errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      });

    await coverPipe.transform(files.song_cover_img[0]);
    await songPipe.transform(files.song_file[0]);

    const postPayload = {
      song_name: body.song_name,
      song_description: body.song_description,
      tags: body.tags,
      rating: body.rating,
      song_file: files.song_file[0],
      song_cover_img: files.song_cover_img[0],
    };

    return await this.musicService.postSong(user_id, postPayload);
  }

  @ApiOperation({ summary: 'Editar una publicación de música' })
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        song_id: {
          type: 'string',
          example: '123e4567-e89b-12d3-a456-426614174000',
        },
        song_name: { type: 'string', example: 'Mi canción editada' },
        song_description: {
          type: 'string',
          example: 'Una descripción actualizada',
        },
        song_cover_url: {
          type: 'string',
          example: 'https://example.com/covers/song.jpg',
        },
        song_cover_img: { type: 'string', format: 'binary'},
        tags: {
          type: 'array',
          items: { type: 'string' },
          example: ['rock', 'alternativo'],
        },
        rating: { type: 'string', example: 'G' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Publicación de música actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos',
  })
  @ApiResponse({
    status: 403,
    description: 'El usuario no es propietario del post',
  })
  @Put('EditSongPost')
  @UseGuards(SupabaseAuthGuard)
  async editSongPost(
    @Req() req : any,
    @Body() body : EditMusicPostDto,
    @UploadedFile() file : Express.Multer.File,
  ){
    const currentUser_id = req.user.id;

    const postPayload = {
      ...body,
      song_cover_img : file,
    }

    return await this.musicService.editSongPost(postPayload, currentUser_id);
  }
}