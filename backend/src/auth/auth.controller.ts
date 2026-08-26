import { Controller, Post, Body } from "@nestjs/common";
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
}