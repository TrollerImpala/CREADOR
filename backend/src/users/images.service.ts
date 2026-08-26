import { Injectable } from "@nestjs/common";

import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../config/supabaseClient";


@Injectable()
export class userImagesService{
    constructor(
        private readonly supabase : SupabaseClient,
        private readonly supabaseService : SupabaseService
    ){
        this.supabase = this.supabaseService.getClient();
    }

    // async uploadAvatar( avatarUrl, user_tag ){
    //     const {data, error} = await this.supabase
    //     .storage
    //     .from('USERS')
    //     .upload(
    //     `AVATARS/${user_tag}_avatar`,
    //         avatarUrl
    //     );

    //     if (error) throw new Error(error.message);

    //     return {
    //         mensaje : 'Avatar subido',
    //         avatarUrl : data?.fullPath
    //     };
    // }

}