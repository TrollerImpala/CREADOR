import { Injectable, BadRequestException } from "@nestjs/common";

import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../sub_services/supabaseClient";

import { StorageService } from "../sub_services/storage.service";

@Injectable()
export class ArtService{
    private readonly supabase : SupabaseClient;
    
    constructor(
        private readonly supabaseService : SupabaseService,
        private readonly storageService : StorageService
    ){
        this.supabase = this.supabaseService.getClient();
    }


    async getArtPosts(){
        const {data, error} = await this.supabase
        .from('ARTPOSTS')
        .select('artpost_id, title, art_img_url, rating');

        if (error) throw new BadRequestException('Error al obtener posts de arte' + error.message);

        return{
            mensaje : 'Arte obtenido',
            art : data
        };
    }

    async getArtPost(id_art : string){
        const {data, error} = await this.supabase
        .from('ARTPOSTS')
        .select()
        .eq('artpost_id', id_art)
        .single();

        if (error) throw new BadRequestException('Error al obtener post de arte' + error.message);

        return{
            mensaje : 'Arte obtenido',
            art : data
        };
    }

    async deletePost(artpost_id : string){
        const { data, error } = await this.supabase
        .from('ARTPOSTS')
        .delete()
        .eq('artpost_id', artpost_id)
        .select()
        .single();

        if (error) throw new BadRequestException('Error al eliminar el Arte');

        const filePath = data.art_img_url.split('/ART/').pop();
        
        if (filePath) {
            await this.storageService.deleteFile('ART', filePath);
        }

        return {
            mensaje : 'Post eliminado con exito',
            deletedData : data
        };
    }


    async postArt(user_id : string, body : any){
        const {title, art_img, description, tags, rating} = body;

        const fileExtension = art_img.originalname.split('.').pop() || 'png';

        const filePath = `${title}-${Date.now()}.${fileExtension}`;

        const art_img_url = await this.storageService.uploadFile('ART', filePath, art_img);

        const {data, error} = await this.supabase
        .from('ARTPOSTS')
        .insert({
            title,
            art_img_url,
            description,
            tags,
            rating,
            user_id
        })
        .select()
        .single();

        if ( error ) throw new BadRequestException('Error al subir info del post de Arte');

        return {
            mensaje : 'Subida de arte exitosa',
            art : data
        }
    }
}