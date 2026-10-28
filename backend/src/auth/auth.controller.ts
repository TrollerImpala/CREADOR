import { Controller, Post, Get, Body, Headers, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";

import { SupabaseAuthGuard } from "../guards/auth.guard";

import { RegisterAuthDto, LoginAuthDto } from "../DTO/auth.dto";


import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('Auth')
export class AuthController{
    constructor(private readonly authService : AuthService) {};

    @Post('Register')
    async register(@Body() body : RegisterAuthDto){
        return this.authService.register(body);
    }

    @Post('Login')
    async login(@Body() body : LoginAuthDto){
        return this.authService.login(body);
    }

    @Post('Refresh')
    async refresh(@Body() body : {refresh_token : string}){
        return this.authService.refresh_token(body.refresh_token);
    }

    @ApiOperation({ summary: 'Cerrar sesión de usuario' })
    @ApiBearerAuth()

    @UseGuards(SupabaseAuthGuard)
    @Post('LogOut')
    async log_out(@Headers('authorization') authHeader: string) {
        const token = authHeader?.replace('Bearer ', '').trim();
        return this.authService.log_out(token);
    }
    
}