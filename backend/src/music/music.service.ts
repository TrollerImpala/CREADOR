import { Injectable, BadRequestException } from "@nestjs/common";

import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../sub_services/supabaseClient";

import { GeneralPostsService } from "../sub_services/general-posts.service";
import { StorageService } from "../sub_services/storage.service";

@Injectable()
export class MusicService{
    private readonly supabase : SupabaseClient;
    
    constructor(
        private readonly supabaseService : SupabaseService,
        private readonly storageService : StorageService,
        private readonly generalPostsService : GeneralPostsService
    ){
        this.supabase = this.supabaseService.getClient();
    }


    async getMusicPosts(){
        const {data, error} = await this.supabase
        .from('MUSICPOSTS')
        .select('song_id, song_name, song_url, song_cover_url, rating');

        if (error) throw new BadRequestException('Error al obtener posts de musica' + error.message);

        return{
            mensaje : 'Musica obtenida',
            songs : data
        };
    }

    async getMusicPost(id_song : string){
        const {data, error} = await this.supabase
        .from('MUSICPOSTS')
        .select()
        .eq('song_id', id_song)
        .single();

        if (error) throw new BadRequestException('Error al obtener post de musica' + error.message);

        return{
            mensaje : 'Cancion obtenida',
            song : data
        };
    }
}