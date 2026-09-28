import { Injectable, BadRequestException } from "@nestjs/common";

import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../sub_services/supabaseClient";

import { GeneralPostsService } from "../sub_services/general-posts.service";
import { StorageService } from "../sub_services/storage.service";

@Injectable()
export class GameService{
    private readonly supabase : SupabaseClient;
    
    constructor(
        private readonly supabaseService : SupabaseService,
        private readonly storageService : StorageService,
        private readonly generalPostsService : GeneralPostsService
    ){
        this.supabase = this.supabaseService.getClient();
    }


    async getGamePosts(){
        const {data, error} = await this.supabase
        .from('GAMEPOSTS')
        .select('game_id, game_title, game_cover_url, game_rating, mobile_friendly');

        if (error) throw new BadRequestException('Error al obtener posts de juegos' + error.message);

        return{
            mensaje : 'Juegos obtenidos',
            games : data
        };
    }

    async getGamePost(id_game : string){
        const {data, error} = await this.supabase
        .from('GAMEPOSTS')
        .select()
        .eq('game_id', id_game)
        .single();

        if (error) throw new BadRequestException('Error al obtener post de juegos' + error.message);

        return{
            mensaje : 'Juego obtenido',
            game : data
        };
    }
}