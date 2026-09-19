import { Injectable, BadRequestException } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "./supabaseClient";

@Injectable()
export class GeneralPostsService{
    private readonly supabase : SupabaseClient;
    
    constructor(
        private readonly supabaseService : SupabaseService
    ){
        this.supabase = supabaseService.getClient();
    }

    async createStat(){
        const {data, error} = await this.supabase
        .from('POSTSTATS')
        .insert({})
        .select()
        .single();

        if (error) throw new BadRequestException('Error al crear el stat', error);

        return{
            stat : data,
            mensaje : 'Stat creado'
        };
    }

    async deleteStat(stat_id : string){
        const {data, error} = await this.supabase
        .from('POSTSTATS')
        .delete()
        .eq('stats_id', stat_id)
        .select()
        .single();
    }


}