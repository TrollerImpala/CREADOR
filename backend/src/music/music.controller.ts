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

import { MusicService } from "./music.service";

import type { CreateArtPostDto } from "../DTO/art.dto";
import type { UploadedFileDto } from "../DTO/file.dto";

@Controller('Music')
export class MusicController{
    constructor(private readonly musicService : MusicService){}

    @Get('MusicPosts')
    //@UseGuards(SupabaseAuthGuard)
    async getMusicPosts(){
        return await this.musicService.getMusicPosts();
    }

    @Get('MusicPost/:id')
    async getMusicPost(@Param('id') id : string){
        return await this.musicService.getMusicPost(id);
    }

}