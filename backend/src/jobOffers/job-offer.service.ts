import { Injectable, BadRequestException } from "@nestjs/common";

import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "../sub_services/supabaseClient";

import { GeneralPostsService } from "../sub_services/general-posts.service";
import { StorageService } from "../sub_services/storage.service";

@Injectable()
export class JobOfferService{
    private readonly supabase : SupabaseClient;
    
    constructor(
        private readonly supabaseService : SupabaseService,
        private readonly storageService : StorageService,
        private readonly generalPostsService : GeneralPostsService
    ){
        this.supabase = this.supabaseService.getClient();
    }


    async getJobOfferPosts(){
        const {data, error} = await this.supabase
        .from('PROJECTPOSTS')
        .select('project_id, project_title, tags')
        .order('created_at', {ascending : false});

        if (error) throw new BadRequestException('Error al obtener posts de ofertas de trabajo' + error.message);

        return{
            mensaje : 'Ofertas de trabajo obtenidas',
            job_offers : data
        };
    }

    async getJobOfferPost(id_project : string){
        const {data, error} = await this.supabase
        .from('PROJECTPOSTS')
        .select()
        .eq('project_id', id_project)
        .single();

        if (error) throw new BadRequestException('Error al obtener post de oferta de trabajo' + error.message);

        return{
            mensaje : 'Oferta de trabajo obtenida',
            job_offer : data
        };
    }

    async postJobOffer(user_id : string, body : any){
        const {project_title, project_info, email, tags} = body;

        const {data, error} = await this.supabase
        .from('PROJECTPOSTS')
        .insert({
            project_title,
            project_info,
            email,
            tags,
            user_id,
        })
        .select()
        .single();

        if ( error ) {
            console.log(error);
            throw new BadRequestException('Error al subir info de oferta de trabajo');
        } 

        return {
            mensaje : 'Subida de oferta exitosa',
            job_offer : data
        }
    }
}