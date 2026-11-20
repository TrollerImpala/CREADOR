/**
 * job-offer.service.ts — Lógica de las ofertas de trabajo.
 *
 * Capa: service (lógica de negocio + acceso a datos).
 * Tabla principal: PROJECTPOSTS.
 * Relación: PROJECTPOSTS.user_id → USERS.id_user (muchas ofertas por usuario).
 *
 * Patrón de consulta:
 *   .from('TABLA').select('columnas').eq(...).order(...).range(...)
 *
 * Este service es la mejor plantilla para copiar cuando pidan un CRUD nuevo.
 */
import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../sub_services/supabaseClient';

import { StatsCreatorService } from '../sub_services/stats_creator';
import { StorageService } from '../sub_services/storage.service';

@Injectable()
export class JobOfferService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly storageService: StorageService,
    private readonly statsCreatorService: StatsCreatorService,
  ) {
    // Cliente compartido de Supabase (clave anon + RLS).
    this.supabase = this.supabaseService.getClient();
  }

  /**
   * Lista paginada de ofertas para la galería.
   *
   * Devuelve solo 3 columnas: la vista de lista no necesita el detalle.
   * Si agregás un campo que la lista debe mostrar, tenés que sumarlo acá.
   *
   * Ojo con el rango: .range(from, from + limit) trae limit + 1 filas.
   * Es intencional: el frontend usa esa fila extra para saber si hay
   * próxima página y luego hace pop(). No lo cambies sin ajustar el frontend.
   */
  async getJobOfferPosts(from: number, limit: number) {
    const { data, error } = await this.supabase
      .from('PROJECTPOSTS')
      .select('project_id, project_title, tags')
      .order('created_at', { ascending: false })
      .range(from, from + limit);

    if (error)
      throw new BadRequestException(
        'Error al obtener posts de ofertas de trabajo' + error.message,
      );

    return {
      mensaje: 'Ofertas de trabajo obtenidas',
      job_offers: data,
    };
  }

  /**
   * Igual que la lista anterior, pero filtrada por autor.
   * .eq('user_id', user_id) equivale a WHERE user_id = ...
   */
  async getUserJobOfferPosts(user_id: string, from: number, limit: number) {
    const { data, error } = await this.supabase
      .from('PROJECTPOSTS')
      .select('project_id, project_title, tags')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .range(from, from + limit);

    if (error)
      throw new BadRequestException(
        'Error al obtener posts de ofertas de trabajo' + error.message,
      );

    return {
      mensaje: 'Ofertas de trabajo obtenidas',
      job_offers: data,
    };
  }

  /**
   * Detalle de una oferta con los datos públicos del autor.
   *
   * select('*, USERS(...)') es una relación anidada de Supabase/PostgREST:
   * trae todas las columnas de PROJECTPOSTS y, dentro de USERS, solo las
   * columnas indicadas. Requiere que exista la FK user_id → USERS.
   *
   * .single() exige exactamente una fila; si no existe, devuelve error.
   */
  async getJobOfferPost(id_project: string) {
    const { data, error } = await this.supabase
      .from('PROJECTPOSTS')
      .select('*, USERS(user_name, user_tag, user_avatar_url)')
      .eq('project_id', id_project)
      .single();

    if (error)
      throw new BadRequestException(
        'Error al obtener post de oferta de trabajo' + error.message,
      );

    return {
      mensaje: 'Oferta de trabajo obtenida',
      job_offer: data,
    };
  }

  /**
   * Inserta una oferta nueva.
   *
   * El user_id viene del token validado por el guard, no del body:
   * así el usuario no puede crear publicaciones a nombre de otro.
   *
   * .insert({...}).select().single() devuelve la fila recién creada,
   * que el controller retorna al frontend.
   */
  async postJobOffer(user_id: string, body: any) {
    const { project_title, project_info, email, tags } = body;

    const { data, error } = await this.supabase
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

    if (error) {
      // Log interno para depurar; al cliente se le devuelve un mensaje genérico.
      console.log(error);
      throw new BadRequestException('Error al subir info de oferta de trabajo');
    }

    return {
      mensaje: 'Subida de oferta exitosa',
      job_offer: data,
    };
  }

  async editJobOfferPost(body : any, currentUser_id : string){
    const { jobOffer_id, project_title, project_info, email, tags } = body;

    const { job_offer } = await this.getJobOfferPost(jobOffer_id);

    if (job_offer.user_id !== currentUser_id) throw new ForbiddenException('No eres dueño del post para editarlo');


    const { data, error } = await this.supabase
    .from('PROJECTPOSTS')
    .update({
      project_title,
      project_info,
      email,
      tags
    })
    .eq('project_id', jobOffer_id)
    .select()
    .single();

    if ( error ) throw new BadRequestException('Error al actualizar la oferta', error.message);

    return {
      mensaje : 'Oferta actualizada',
      job_offer : data
    };
  }

  /**
   * Borra una oferta por project_id y devuelve la fila eliminada.
   *
   * Este método existe en el service, pero el JobOfferController no lo expone.
   * El borrado real se hace desde GeneralPostsService, que decide permisos
   * (dueño o moderador) antes de llamar acá.
   */
  async deletePost(project_id: string) {
    const { data, error } = await this.supabase
      .from('PROJECTPOSTS')
      .delete()
      .eq('project_id', project_id)
      .select()
      .single();

    if (error) {
      console.error('Error detallado de Supabase (JobOffer):', error.message);
      throw new BadRequestException(
        'Error al eliminar la oferta de trabajo: ' + error.message,
      );
    }

    return {
      mensaje: 'Oferta de trabajo eliminada con éxito',
      deletedData: data,
    };
  }
}
