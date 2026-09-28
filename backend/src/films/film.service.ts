import { Injectable, BadRequestException } from "@nestjs/common";

import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../sub_services/supabaseClient";

import { GeneralPostsService } from "../sub_services/general-posts.service";
import { StorageService } from "../sub_services/storage.service";

@Injectable()
export class FilmService{
    private readonly supabase : SupabaseClient;
    
    constructor(
        private readonly supabaseService : SupabaseService,
        private readonly storageService : StorageService,
        private readonly generalPostsService : GeneralPostsService
    ){
        this.supabase = this.supabaseService.getClient();
    }


    async getFilmPosts(){
        const {data, error} = await this.supabase
        .from('FILMPOSTS')
        .select('film_id, film_title, film_thumbnail_url, rating');

        if (error) throw new BadRequestException('Error al obtener posts de filmes' + error.message);

        return{
            mensaje : 'Filmes obtenidos',
            films : data
        };
    }

    async getFilmPost(id_film : string){
        const {data, error} = await this.supabase
        .from('FILMPOSTS')
        .select()
        .eq('film_id', id_film)
        .single();

        if (error) throw new BadRequestException('Error al obtener post de filmes' + error.message);

        return{
            mensaje : 'Filme obtenido',
            film : data
        };
    }
}