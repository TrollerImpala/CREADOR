import { Injectable, BadRequestException } from "@nestjs/common";

import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../sub_services/supabaseClient";

import { StorageService } from "../sub_services/storage.service";

import { UserDto } from "../DTO/user.dto";

@Injectable()
export class UserService{
    constructor(
        private readonly supabase : SupabaseClient,
        private readonly supabaseService : SupabaseService,
        private readonly storageService : StorageService
    ){
        this.supabase = this.supabaseService.getClient();
    }

    async getUserData(user_id : string){
        const { data, error } = await this.supabase
        .from('USERS')
        .select()
        .eq('id_user', user_id)
        .single();

        if (error) throw new BadRequestException('Error al conseguir perfil', error.message);

        return {
            user : data,
            mensaje : 'Perfil obtenido'
        };
    }

    async updateUser(user_id : string, body : UserDto){
        const { userTag, userName, userDescription, avatarUrl, socialMedias } = body;

        const {data : userTagVerif, error : errorTagVerif} = await this.supabase
        .from('USERS')
        .select()
        .eq('user_tag', userTag);

        if (userTagVerif) throw new BadRequestException('Tag ya existente, elije otro'); 

        const { data, error } = await this.supabase
        .from('USERS')
        .update({
            user_tag: userTag,
            user_name: userName,
            user_description: userDescription || '',
            user_avatar_url: avatarUrl || '',
            social_medias: socialMedias || []
        })
        .eq('id_user', user_id)
        .select();

        if (error) throw new BadRequestException('Error al actualizar perfil', error.message);

        return {
            mensaje : `Usuario ${userTag} Actualizado`
        };
    }
}