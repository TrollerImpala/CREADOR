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

import { CreateJobOfferPostDto } from "../DTO/joboffer.dto";

import { UploadedFileDto } from "../DTO/file.dto";

import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Job Offer Posts')
@Controller('JobOffer')
export class JobOfferController{
    constructor(private readonly jobOfferService : JobOfferService){}

    @ApiOperation({ summary: 'Obtener todas las publicaciones de ofertas de trabajo' })
    @ApiResponse({ status: 200, description: 'Devuelve todas las publicaciones de ofertas de trabajo' })

    @Get('JobOfferPosts')
    //@UseGuards(SupabaseAuthGuard)
    async getJobOfferPosts(){
        return await this.jobOfferService.getJobOfferPosts();
    }
    
    @ApiOperation({ summary: 'Obtener una publicación de oferta de trabajo específica' })
    @ApiResponse({ status: 200, description: 'Devuelve la publicación de oferta de trabajo solicitada' })

    @Get('JobOfferPost/:id')
    async getJobOfferPost(@Param('id') id : string){
        return await this.jobOfferService.getJobOfferPost(id);
    }

    @ApiOperation({ summary: 'Crear una nueva publicación de oferta de trabajo' })
    @ApiResponse({ status: 201, description: 'Devuelve la publicación de oferta de trabajo creada' })
    @ApiBody({
    schema: {
        type: 'object',
        properties: {
            project_title: { type: 'string', example: 'La aventura de Pepe' },
            project_info: { type: 'string', example: 'Detalles sobre la oferta' },
            email: { type: 'string', example: 'example@gmail.com' },
            tags: { type: 'array', items: { type: 'string' }, example: ['programacion', 'arte'] },
        },
    },
    })
    @ApiBearerAuth()

    @Post('PostJobOffer')
    @UseGuards(SupabaseAuthGuard)
    async postJobOffer(
        @Req() req : any,
        @Body() body : CreateJobOfferPostDto
        ){
        const user_id = req.user.id;
        return await this.jobOfferService.postJobOffer(user_id, body);
    }

}