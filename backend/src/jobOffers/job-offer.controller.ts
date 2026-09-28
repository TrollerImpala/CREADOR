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

import { JobOfferService } from "./job-offer.service";

import type { CreateArtPostDto } from "../DTO/art.dto";
import type { UploadedFileDto } from "../DTO/file.dto";

@Controller('JobOffer')
export class JobOfferController{
    constructor(private readonly jobOfferService : JobOfferService){}

    @Get('JobOfferPosts')
    //@UseGuards(SupabaseAuthGuard)
    async getJobOfferPosts(){
        return await this.jobOfferService.getJobOfferPosts();
    }

    @Get('JobOfferPost/:id')
    async getJobOfferPost(@Param('id') id : string){
        return await this.jobOfferService.getJobOfferPost(id);
    }

}