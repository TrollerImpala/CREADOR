import { Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    Req, 
    UseInterceptors, 
    UploadedFile, 
    BadRequestException,
    UploadedFiles,
    HttpStatus,
    ParseFilePipeBuilder
} from "@nestjs/common";

import 'multer';

import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

import { SupabaseAuthGuard } from "../auth/auth.guard";

import { MusicService } from "./music.service";

import { CreateMusicPostDto } from "../DTO/music.dto";
//import type { UploadedFileDto } from "../DTO/file.dto";

@ApiTags('Music Posts')
@Controller('Music')
export class MusicController{
    constructor(private readonly musicService : MusicService){}


    @ApiOperation({ summary: 'Obtener todas las publicaciones de música' })
    @ApiResponse({ status: 200, description: 'Devuelve todas las publicaciones de música' })
    
    @Get('MusicPosts')
    //@UseGuards(SupabaseAuthGuard)
    async getMusicPosts(){
        return await this.musicService.getMusicPosts();
    }


    @ApiOperation({ summary: 'Obtener una publicación de música específica' })
    @ApiResponse({ status: 200, description: 'Devuelve la publicación de música solicitada' })
    
    @Get('MusicPost/:id')
    async getMusicPost(@Param('id') id : string){
        return await this.musicService.getMusicPost(id);
    }


    @ApiOperation({ summary: 'Crear una nueva publicación de música' })
    @ApiResponse({ status: 201, description: 'Publicación de música creada exitosamente' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                song_name: { type: 'string', example: 'Mi primera canción' },
                song_file: { type: 'string', format: 'binary' },
                song_cover_img: { type: 'string', format: 'binary' },
                song_description: { type: 'string', example: 'Una canción hermosa y emotiva' },
                tags: { type: 'array', items: { type: 'string' }, example: ['rock', 'pop'] },
                rating: { type: 'string', example: 'G' },
            },
        },
    })
    @ApiBearerAuth()
    
    @Post('PostMusic')
    @UseGuards(SupabaseAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        {name : 'song_file', maxCount : 1},
        {name : 'song_cover_img', maxCount : 1}
    ]))
    async postSong(
        @Req() req : any,
        @Body() body : CreateMusicPostDto,
        @UploadedFiles() files : { song_file : Express.Multer.File; song_cover_img : Express.Multer.File }
    ){
        if (!files.song_file || !files.song_cover_img) {
            throw new BadRequestException('El archivo de música y la imagen de portada son obligatorios');
        }

        const user_id = req.user.id;

        const coverPipe = new ParseFilePipeBuilder()
        .addFileTypeValidator({
            fileType: 'image/(jpg|jpeg|png|gif|pdf)', 
        })
        .build({
            fileIsRequired : true,
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY 
        })

        const songPipe = new ParseFilePipeBuilder()
        .addFileTypeValidator({
            fileType: 'audio/(mp3|wav|ogg|flac|mpeg)', 
        })
        .build({
            fileIsRequired : true,
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY 
        })

        console.log(body);
        console.log(files);

        await coverPipe.transform(files.song_cover_img[0]);
        await songPipe.transform(files.song_file[0]);
        
        const postPayload = {
            song_name: body.song_name,
            song_description: body.song_description,
            tags: body.tags,
            rating: body.rating,
            song_file: files.song_file[0],
            song_cover_img: files.song_cover_img[0]
        };

        return await this.musicService.postSong(user_id, postPayload);
    }

}