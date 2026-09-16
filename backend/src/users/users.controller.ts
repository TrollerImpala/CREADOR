import { Controller, Post, Get, Body, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";

import { SupabaseAuthGuard } from "../auth/auth.guard";

@Controller('Auth')
export class AuthController{
    constructor(private readonly userService : UserService) {};

    @Post('Perfil')
    @UseGuards(SupabaseAuthGuard)
    async getProfile(@Req() req : any){
        
        const userId = req.user.id_user;

        return this.userService.getUserData(userId);
    }

    @Post('ActualizarPerfil')
    @UseGuards(SupabaseAuthGuard)
    async updateProfile(
        @Req() req : any,
        @Body() body : any
    ){

        const userId = req.user.id_user;

        return this.userService.updateUser(userId, body);
    }
}