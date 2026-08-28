import { Controller, Post, Get, Body, Param, UseGuards } from "@nestjs/common";

import { SupabaseAuthGuard } from "../auth/auth.guard";

import { ArtService } from "./art.service";


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
}