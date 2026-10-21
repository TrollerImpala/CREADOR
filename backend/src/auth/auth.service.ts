import { Injectable, BadRequestException, UnauthorizedException } from "@nestjs/common";

import { SupabaseClient } from "@supabase/supabase-js";
//import { supabase } from "../config/supabaseClient";
import { SupabaseService } from "../sub_services/supabaseClient";

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
        const { email, password, userTag, userName, userDescription, socialMedias } = body;

        const { data : authData, error : authError } = await this.supabase.auth.signUp({
            email,
            password,
            options : {
                data : {
                    user_tag: userTag,
                    user_name: userName,
                    user_description: userDescription || '',
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
            .select('user_name, user_avatar_url')
            .eq('id_user', data.user.id)
            .single();
        
        return {
            mensaje : 'Usuario logeado con exito',
            user_token : data.session.access_token,
            refresh_token : data.session.refresh_token,
            user : profile
        };
    }

    async verify_session(){
        const {data : { session }, error} = await this.supabase.auth.getSession();

        //console.log(localStorage.getItem('access_token'));

        if (!session) throw new Error('No se ha iniciado');

        if (error || !session) throw new Error('No se ha iniciado sesion o no se pudo refrescar el token');

        return { access_token : session.access_token };
    }

    async refresh_token(refresh_token : string){
        if (!refresh_token) throw new Error('No se proporciono refresh token');

        const {data, error} = await this.supabase.auth.refreshSession({refresh_token : refresh_token});

        if (error || !data.session) {
            throw new UnauthorizedException('No se pudo refrescar el token, la sesión ha expirado');
        }

        return { 
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token
        };
    }

    async log_out(){
        const { error } = await this.supabase.auth.signOut();

        return {
            mensaje : 'Cierre de sesion exitante'
        };
    }
}