import { Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    Req, 
    Query,
    UseInterceptors, 
    UploadedFile, 
    BadRequestException
} from "@nestjs/common";

import { Roles } from "../decorators/role.decorator";
import { Role } from "../enum/roles.enum";

import 'multer';

import { FileInterceptor } from '@nestjs/platform-express';

import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

import { SupabaseAuthGuard } from "../guards/auth.guard";
import { RolesGuard } from "../guards/roles.guard";

import { ArtService } from "./art.service";

import { CreateArtPostDto } from "../DTO/art.dto";
//import type { UploadedFileDto } from "../DTO/file.dto";

@ApiTags('Art Posts')
@Controller('Art')
export class ArtController{
    constructor(private readonly artService : ArtService){}


    @ApiOperation({ summary: 'Obtener todas las publicaciones de arte' })
    @ApiResponse({ status: 200, description: 'Devuelve todas las publicaciones de arte' })
    
    @Get('ArtPosts')
    //@UseGuards(SupabaseAuthGuard)
    async getArtPosts(
        @Query('from') from: number,
        @Query('limit') limit: number
    ){
        return await this.artService.getArtPosts(from, limit);
    }

    @Get('UserArtPosts/:id')
    async getUserArtPosts(
        @Param('id') user_id : string,
        @Query('from') from: number,
        @Query('limit') limit: number
    ){
        return await this.artService.getUserArtPosts(user_id, from, limit)
    }

    @ApiOperation({ summary: 'Obtener una publicación de arte específica' })
    @ApiResponse({ status: 200, description: 'Devuelve la publicación de arte solicitada' })
    
    @Get('ArtPost/:id')
    async getArtPost(@Param('id') id : string){
        return await this.artService.getArtPost(id);
    }


    @ApiOperation({ summary: 'Crear una nueva publicación de arte' })
    @ApiResponse({ status: 201, description: 'Publicación de arte creada exitosamente' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
    schema: {
        type: 'object',
        properties: {
            title: { type: 'string', example: 'Ilustración Gothic' },
            art_img: { type: 'string', format: 'binary' },
            description: { type: 'string', example: 'Detalles sobre la obra' },
            tags: { type: 'array', items: { type: 'string' }, example: ['gothic', 'digital'] },
            rating: { type: 'string', example: 'G' },
        },
    },
    })
    @ApiBearerAuth()

    @Post('PostArt')
    @UseGuards(SupabaseAuthGuard)
    @UseInterceptors(FileInterceptor('art_img'))
    async createArtPost(
        @Req() req : any,
        @Body() body : CreateArtPostDto,
        @UploadedFile() file : Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException('El archivo de imagen es obligatorio');
        }

        const userId = req.user.id;

        console.log(body);
        console.log(file);

        const postPayload = {
            title: body.title,
            description: body.description,
            tags: body.tags,
            rating: body.rating,
            art_img : file
        };

    return this.artService.postArt(userId, postPayload);
  }
}