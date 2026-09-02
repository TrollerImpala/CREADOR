import { Injectable } from "@nestjs/common";
import { SupabaseClient, createClient } from "@supabase/supabase-js";

// import { ConfigService } from "@nestjs/config";
// import { Injectable } from "@nestjs/common";

// const configService = new ConfigService(); 
// const supabaseURL = configService.get<string>('SUPABASE_URL');

// const supabaseURL = process.env.SUPABASE_URL;
// const supabaseAnonKEY = process.env.SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseURL, supabaseAnonKEY);

@Injectable()
export class SupabaseService{
    private readonly supabase : SupabaseClient;

    constructor(){
        const supabaseURL = process.env.SUPABASE_URL;
        const supabaseAnonKEY = process.env.SUPABASE_ANON_KEY;
        this.supabase = createClient(supabaseURL!, supabaseAnonKEY!);
    }

    getClient() : SupabaseClient {
        return this.supabase;
    }
}

// @Injectable()
// export class supabaseService{
//     private readonly supabase : SupabaseClient;

//     constructor(private configService : ConfigService){
//         const supabaseURL = this.configService.get<string>('SUPABASE_URL');
//         const supabaseAnonKEY = this.configService.get<string>('SUPABASE_ANON_KEY');
//         this.supabase = createClient(supabaseURL, supabaseAnonKEY);
//     }

//     getClient() : SupabaseClient {
//         return this.supabase
//     }
// }