import { Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common";

import { SupabaseClient } from "@supabase/supabase-js";
//import { supabase } from "../config/supabaseClient";
import { SupabaseService } from "../config/supabaseClient";

import { mergeInternals } from "rxjs/internal/operators/mergeInternals";

@Injectable()
export class AuthService{

   private readonly supabase : SupabaseClient;

    constructor(
        //private readonly supabase : SupabaseClient,
        private readonly supabaseService : SupabaseService
    ){
        this.supabase = this.supabaseService.getClient();
    }


    //                                  REGISTRO
    async register(body : any){
        const { email, password, userTag, userName, userDescription, avatarUrl, socialMedias } = body;

        const { data : authData, error : authError } = await this.supabase.auth.signUp({
            email,
            password,
            options : {
                data : {
                    user_tag: userTag,
                    user_name: userName,
                    user_description: userDescription || '',
                    user_avatar_url: avatarUrl || 'https://img.magnific.com/vector-gratis/icono-herramienta-pincel-arte_24877-83203.jpg?semt=ais_hybrid&w=740&q=80',
                    social_medias: socialMedias || []
                },
            },
        });

        if (authError) throw new BadRequestException(authError.message);

        // const authUserId = authData.user?.id;

        // if (!authUserId) throw new Error('No se pudo obtener el id del auth.user');
        
        // const { error } = await this.supabase
        // .from('USERS')
        // .insert( {
        //     id_user : authUserId,
        //     user_tag: userTag,
        //     user_name: userName,
        //     user_description: userDescription || '',
        //     user_avatar_url: avatarUrl || '',
        //     social_medias: socialMedias || []
            
        // } );
        
        // if (error) throw new BadRequestException(error.message);
        
        return {
            mensaje : 'Usuario registrado con exito',
            user : authData.user
        };
    }


    //                                     LOGIN
    async login(body : any){
        const { email, password } = body;

        const { data, error } = await this.supabase.auth.signInWithPassword( { email, password } );

        if (error) throw new UnauthorizedException(error.message);

        const { data : profile } = await this.supabase
            .from('USERS')
            .select('*')
            .eq('id_user', data.user.id)
            .single()
        
        return {
            mensaje : 'Usuario logeado con exito',
            user_token : data.session.access_token,
            user : profile
        };
    }
}