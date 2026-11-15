/**
 * stats_creator.ts — Creación y borrado de estadísticas de publicaciones.
 *
 * Capa: sub_services (infraestructura / apoyo).
 * Cada post (arte, música, oferta) crea una fila en POSTSTATS y guarda su id.
 * Es una relación 1:1 entre el post y sus estadísticas.
 *
 * Se separó en un servicio propio para no repetir el insert en cada módulo.
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabaseClient';

@Injectable()
export class StatsCreatorService {
  private readonly supabase: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabase = supabaseService.getClient();
  }

  /**
   * Inserta una fila vacía en POSTSTATS y devuelve la fila creada.
   * El insert({}) funciona porque las columnas tienen valores por defecto
   * (por ejemplo, contadores en 0).
   */
  async createStat() {
    const { data, error } = await this.supabase
      .from('POSTSTATS')
      .insert({})
      .select()
      .single();

    if (error) throw new BadRequestException('Error al crear el stat', error);

    return {
      stat: data,
      mensaje: 'Stat creado',
    };
  }

  /**
   * Borra la fila de POSTSTATS asociada a un post.
   * Se llama al eliminar un post para evitar estadísticas huérfanas.
   */
  async deleteStat(stat_id: string) {
    await this.supabase
      .from('POSTSTATS')
      .delete()
      .eq('stats_id', stat_id)
      .select()
      .single();
  }
}
