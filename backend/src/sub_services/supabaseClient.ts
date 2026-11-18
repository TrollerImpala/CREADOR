/**
 * supabaseClient.ts — Servicio de infraestructura para Supabase.
 *
 * Capa: sub_services (infraestructura).
 * Crea y expone el cliente de Supabase que usan los services del dominio.
 *
 * Hay dos clientes:
 * - getClient(): cliente global con la clave anon. Se usa para DB y Storage.
 * - getUserClient(token): cliente que envía el token del usuario en el header
 *   Authorization. Se usa para operaciones que dependen de la sesión, como
 *   signOut o auth.getUser. Sigue usando la clave anon: la autorización real
 *   la aplican Supabase Auth y las políticas RLS.
 *
 * Las variables SUPABASE_URL y SUPABASE_ANON_KEY se cargan desde backend/.env
 * (o desde las variables de entorno de Render). Nunca deben estar hardcodeadas.
 */
import { Injectable } from '@nestjs/common';
import { SupabaseClient, createClient } from '@supabase/supabase-js';

// import { ConfigService } from "@nestjs/config";
// import { Injectable } from "@nestjs/common";

// const configService = new ConfigService();
// const supabaseURL = configService.get<string>('SUPABASE_URL');

// const supabaseURL = process.env.SUPABASE_URL;
// const supabaseAnonKEY = process.env.SUPABASE_ANON_KEY;

// export const supabase = createClient(supabaseURL, supabaseAnonKEY);

@Injectable()
export class SupabaseService {
  private readonly supabase: SupabaseClient;

  constructor() {
    const supabaseURL = process.env.SUPABASE_URL;
    const supabaseAnonKEY = process.env.SUPABASE_ANON_KEY;
    this.supabase = createClient(supabaseURL!, supabaseAnonKEY!);
  }

  getClient(): SupabaseClient {
    // Cliente compartido: no guarda sesión de usuario, solo la clave anon.
    return this.supabase;
  }

  /**
   * Devuelve un cliente nuevo que manda el token recibido en cada request.
   * Útil cuando la operación debe ejecutarse "como" ese usuario.
   */
  getUserClient(token: string): SupabaseClient {
    return createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    );
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
