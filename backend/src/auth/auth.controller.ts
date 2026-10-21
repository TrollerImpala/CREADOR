import { Controller, Post, Get, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";

import { RegisterAuthDto, LoginAuthDto } from "../DTO/auth.dto";


import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

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

    @Get('LogOut')
    async log_out(){
        return this.authService.log_out();
    }
}