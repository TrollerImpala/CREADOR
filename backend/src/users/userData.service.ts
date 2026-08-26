import { Injectable } from "@nestjs/common";

import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../config/supabaseClient";


@Injectable()
export class userDataService{
    constructor(
        private readonly supabase : SupabaseClient,
        private readonly supabaseService : SupabaseService
    ){
        this.supabase = this.supabaseService.getClient();
    }

    async updateData(user_token : string, body : any){
        const { userTag, userName, userDescription, avatarUrl, socialMedias } = body;

        const {data : userTagVerif, error : errorTagVerif} = await this.supabase
        .from('USERS')
        .select('')
        .eq('user_tag', userTag);

        if (userTagVerif) throw new Error('Tag ya existente, elije otro'); 


        const { data, error } = await this.supabase
        .from('USERS')
        .update({
            user_tag: userTag,
            user_name: userName,
            user_description: userDescription || '',
            user_avatar_url: avatarUrl || '',
            social_medias: socialMedias || []
        })
        .eq(
            'id_user', user_token
        )
        .select();

        if (error) throw new Error(error.message);

        return {
            mensaje : `Usuario ${userTag} Actualizado`
        };
    }
}