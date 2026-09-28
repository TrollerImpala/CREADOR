import { Controller,
    Post,
    Get,
    Body,
    Param,
    UseGuards,
    Req, 
    UseInterceptors, 
    UploadedFile, 
    BadRequestException
} from "@nestjs/common";

import { FileInterceptor } from '@nestjs/platform-express';

import { SupabaseAuthGuard } from "../auth/auth.guard";

import { FilmService } from "./film.service";

import type { CreateArtPostDto } from "../DTO/art.dto";
import type { UploadedFileDto } from "../DTO/file.dto";

@Controller('Film')
export class FilmController{
    constructor(private readonly filmService : FilmService){}

    @Get('FilmPosts')
    //@UseGuards(SupabaseAuthGuard)
    async getFilmPosts(){
        return await this.filmService.getFilmPosts();
    }

    @Get('FilmPost/:id')
    async getFilmPost(@Param('id') id : string){
        return await this.filmService.getFilmPost(id);
    }

}