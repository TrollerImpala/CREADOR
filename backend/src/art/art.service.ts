import { Injectable } from "@nestjs/common";

import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../config/supabaseClient";

@Injectable()
export class ArtService{
    private readonly supabase : SupabaseClient;
    
    constructor(private readonly supabaseService : SupabaseService){
        this.supabase = this.supabaseService.getClient();
    }


    async getArtPosts(){
        const {data, error} = await this.supabase
        .from('ARTPOSTS')
        .select('artpost_id, title, art_img_url, rating');

        if (error) throw new Error('Error al obtener posts de arte' + error.message);

        return{
            mensaje : 'Arte obtenido',
            art : data
        };
    }

    async getArtPost(id_art : string){
        const {data, error} = await this.supabase
        .from('ARTPOSTS')
        .select()
        .eq('id_art', id_art)
        .single();

        if (error) throw new Error('Error al obtener post de arte' + error.message);

        return{
            mensaje : 'Arte obtenido',
            art : data
        };
    }
}