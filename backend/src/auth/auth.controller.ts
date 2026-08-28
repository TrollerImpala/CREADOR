import { Controller, Post, Get, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller('Auth')
export class AuthController{
    constructor(private readonly authService : AuthService) {};

    @Post('Register')
    async register(@Body() body : any){
        return this.authService.register(body);
    }

    @Post('Login')
    async login(@Body() body : any){
        return this.authService.login(body);
    }

    @Get('Refresh')
    async refresh(){
        return this.authService.refresh_token();
    }

    @Get('LogOut')
    async log_out(){
        return this.authService.log_out();
    }
}