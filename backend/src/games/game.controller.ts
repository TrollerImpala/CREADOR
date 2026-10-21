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

import { SupabaseAuthGuard } from "../guards/auth.guard";

import { GameService } from "./game.service";

import type { CreateArtPostDto } from "../DTO/art.dto";
import type { UploadedFileDto } from "../DTO/file.dto";

@Controller('Game')
export class GameController{
    constructor(private readonly gameService : GameService){}

    @Get('GamePosts')
    //@UseGuards(SupabaseAuthGuard)
    async getGamePosts(){
        return await this.gameService.getGamePosts();
    }

    @Get('GamePost/:id')
    async getGamePost(@Param('id') id : string){
        return await this.gameService.getGamePost(id);
    }

}