import { Controller, Post, Get, Put, Body, Req, UseGuards, UseInterceptors, UploadedFile } from "@nestjs/common";
import { UserService } from "./user.service";

import { SupabaseAuthGuard } from "../guards/auth.guard";

import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { FileInterceptor } from "@nestjs/platform-express";

import { UserDto } from "../DTO/user.dto";

@Controller('Users')
export class UsersController{
    constructor(private readonly userService : UserService) {};

    @Post('Perfil')
    @UseGuards(SupabaseAuthGuard)
    async getProfile(@Req() req : any){
        
        const userId = req.user.id_user;

        return this.userService.getUserData(userId);
    }

    @Put('ActualizarPerfil')
    @UseGuards(SupabaseAuthGuard)
    @UseInterceptors(FileInterceptor('profile_img'))
    async updateProfile(
        @Req() req : any,
        @Body() body : UserDto,
        @UploadedFile() file : Express.Multer.File
    ){

        const userId = req.user.id_user;

        const postPayLoad = {
            userTag : body.userTag,
            userName : body.userName,
            userDescription : body.userDescription,
            avatar_img : file ? file : null,
            socialMedias : body.socialMedias || []
        };

        return this.userService.updateUser(userId, postPayLoad);
    }

}