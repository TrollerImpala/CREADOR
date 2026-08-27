import { Controller, Post, Get, Body, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";

import { SupabaseAuthGuard } from "../auth/auth.guard";

@Controller('Auth')
export class AuthController{
    constructor(private readonly userService : UserService) {};

    @Get('Perfil')
    @UseGuards(SupabaseAuthGuard)
    async getProfile(@Req() req){
        
        const userId = req.user.id_user;

        return this.userService.getUserData(userId);
    }
    // async register(@Body() body : any){
    //     return this.authService.register(body);
    // }
}