import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";

import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../sub_services/supabaseClient";

@Injectable()
export class SupabaseAuthGuard implements CanActivate{
    private readonly supabase : SupabaseClient;
    
    constructor(private readonly supabaseService : SupabaseService){
        this.supabase = this.supabaseService.getClient();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        
        // Obtener token
        const token = request.cookies?.access_token || request.headers.authorization?.split(' ')[1];

        if (!token) {
        throw new UnauthorizedException('No se proporcionó token de sesión');
        }

        const { data: { user }, error } = await this.supabase.auth.getUser(token); // Validar token

        if (error || !user) {
        throw new UnauthorizedException('Token inválido o expirado');
        }

        request.user = {
            id: user.id,
            email: user.email,
            role: user.app_metadata?.role || 'user'
        }; // Para uso de controladores

        return true;
    }
}