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

import { ArtService } from "./art.service";

import type { CreateArtPostDto } from "../DTO/art.dto";
import type { UploadedFileDto } from "../DTO/file.dto";

@Controller('Art')
export class ArtController{
    constructor(private readonly artService : ArtService){}

    @Get('ArtPosts')
    //@UseGuards(SupabaseAuthGuard)
    async getArtPosts(){
        return await this.artService.getArtPosts();
    }

    @Get('ArtPost/:id')
    async getArtPost(@Param('id') id : string){
        return await this.artService.getArtPost(id);
    }

    @Post('PostArt')
    @UseGuards(SupabaseAuthGuard)
    @UseInterceptors(FileInterceptor('art_img'))
    async createArtPost(
        @Req() req : any,
        @Body() body : CreateArtPostDto,
        @UploadedFile() file : UploadedFileDto
    ) {
        if (!file) {
            throw new BadRequestException('El archivo de imagen es obligatorio');
        }

        const userId = req.user.id;

        const postPayload = {
            ...body,
            art_img : file
        };

    return this.artService.postArt(userId, postPayload);
  }
}