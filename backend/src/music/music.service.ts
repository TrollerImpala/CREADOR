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


    async getMusicPosts(from: number, limit: number){
        const {data, error} = await this.supabase
        .from('MUSICPOSTS')
        .select('song_id, song_name, song_url, song_cover_url, rating')
        .order('created_at', {ascending : false})
        .range(from, from + limit);

        if (error) throw new BadRequestException('Error al obtener posts de musica' + error.message);
        
        return{
            mensaje : 'Musica obtenida',
            songs : data
        };
    }

    async getMusicPost(id_song : string){
        const {data, error} = await this.supabase
        .from('MUSICPOSTS')
        .select('*, USERS(user_name, user_tag, user_avatar_url)')
        .eq('song_id', id_song)
        .single();

        if (error) throw new BadRequestException('Error al obtener post de musica' + error.message);

        return{
            mensaje : 'Cancion obtenida',
            song : data
        };
    }


    async postSong(user_id : string, body : any){
        const {stat, mensaje} = await this.generalPostsService.createStat();
        console.log(mensaje);
        const stats_id = stat.stats_id;

        const {song_name, song_file, song_description, song_cover_img, tags, rating} = body;

        const coverFileExtension = song_cover_img.originalname.split('.').pop() || 'png';

        const coverFilePath = `SONGCOVERS/${song_name}Cover-${Date.now()}.${coverFileExtension}`;

        const song_cover_url = await this.storageService.uploadFile('MUSIC', coverFilePath, song_cover_img);


        const songFileExtension = song_file.originalname.split('.').pop() || 'png';

        const songFilePath = `SONGS/${song_name}Song-${Date.now()}.${songFileExtension}`;

        const song_url = await this.storageService.uploadFile('MUSIC', songFilePath, song_file);

        const {data, error} = await this.supabase
        .from('MUSICPOSTS')
        .insert({
            song_url,
            song_name,
            song_description,
            user_id,
            song_cover_url,
            stats_id,
            tags,
            rating
        })
        .select()
        .single();

        if ( error ) {
            this.generalPostsService.deleteStat(stats_id);
            this.storageService.deleteFile('MUSIC', coverFilePath);
            this.storageService.deleteFile('MUSIC', songFilePath);

            throw new BadRequestException('Error al subir info del post de Musica: ' + error.message);
        } 

        return {
            mensaje : 'Subida de musica exitosa',
            song : data
        }
    }
}