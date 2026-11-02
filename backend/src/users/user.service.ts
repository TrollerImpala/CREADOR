import { Injectable, BadRequestException } from "@nestjs/common";

import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../sub_services/supabaseClient";

import { StorageService } from "../sub_services/storage.service";

import { UserDto } from "../DTO/user.dto";

@Injectable()
export class UserService{
    private readonly supabase : SupabaseClient;

    constructor(
        private readonly supabaseService : SupabaseService,
        private readonly storageService : StorageService
    ){
        this.supabase = this.supabaseService.getClient();
    }

    async getPublicUserData(user_id : string){
        const { data, error } = await this.supabase
        .from('USERS')
        .select('user_tag, user_name, user_description, user_avatar_url')
        .eq('id_user', user_id)
        .single();

        if (error) throw new BadRequestException('Error al conseguir perfil', error.message);

        return {
            publicUser : data,
            mensaje : 'Perfil publico obtenido'
        };
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

    async updateUser(user_id : string, body : any){
        const { userTag, userName, userDescription, avatar_img, socialMedias } = body;

        const {data : userTagVerif, error : errorTagVerif} = await this.supabase
        .from('USERS')
        .select()
        .eq('user_tag', userTag)
        .neq('id_user', user_id);

        if (errorTagVerif) throw new BadRequestException('Error al verificar tag', errorTagVerif.message);

        if (userTagVerif && userTagVerif.length > 0) throw new BadRequestException('Tag ya existente, elije otro'); 

        let avatarUrl;

        if (avatar_img) {
            const avatarPath = `AVATARS/${user_id}_${avatar_img.originalname}`;
            avatarUrl = await this.storageService.uploadFile('USERS', avatarPath, avatar_img);
        }

        const { data, error } = await this.supabase
        .from('USERS')
        .update({
            user_tag: userTag,
            user_name: userName,
            user_description: userDescription || '',
            user_avatar_url: avatarUrl,
            social_medias: socialMedias || []
        })
        .eq('id_user', user_id)
        .select()
        .single();

        if (error) throw new BadRequestException('Error al actualizar perfil', error.message);

        return {
            mensaje : `Usuario ${userTag} Actualizado`,
            user : data
        };
    }
}