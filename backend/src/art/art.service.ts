/**
 * art.service.ts — Lógica de las publicaciones de arte.
 *
 * Capa: service.
 * Tablas: ARTPOSTS + POSTSTATS. Bucket de Storage: ART.
 *
 * Es el ejemplo más completo de subida de archivos del proyecto:
 * 1. Crea la fila de estadísticas.
 * 2. Sube la imagen a Storage.
 * 3. Inserta el post con la URL y el id de stats.
 * 4. Si el insert falla, hace rollback manual: borra el archivo y el stat.
 *
 * Ese rollback es clave para explicar "manejo de fallas": si una operación
 * posterior falla, no se deben dejar datos ni archivos huérfanos.
 */
import { Injectable, BadRequestException } from '@nestjs/common';

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../sub_services/supabaseClient';

import { StatsCreatorService } from '../sub_services/stats_creator';
import { StorageService } from '../sub_services/storage.service';

@Injectable()
export class ArtService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly storageService: StorageService,
    private readonly statsCreatorService: StatsCreatorService,
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  /**
   * Lista paginada para la galería.
   * Solo trae las columnas necesarias para la tarjeta de vista previa.
   * Igual que en ofertas, .range(from, from + limit) trae una fila extra
   * que el frontend usa para detectar la página siguiente.
   */
  async getArtPosts(from: number, limit: number) {
    const { data, error } = await this.supabase
      .from('ARTPOSTS')
      .select('artpost_id, title, art_img_url, rating')
      .order('created_at', { ascending: false })
      .range(from, from + limit);

    if (error)
      throw new BadRequestException(
        'Error al obtener posts de arte' + error.message,
      );

    return {
      mensaje: 'Arte obtenido',
      art: data,
    };
  }

  /**
   * Detalle de una obra con los datos públicos del autor.
   * Misma relación anidada que en ofertas: USERS(...) dentro del select.
   */
  async getArtPost(id_art: string) {
    const { data, error } = await this.supabase
      .from('ARTPOSTS')
      .select('*, USERS(user_name, user_tag, user_avatar_url)')
      .eq('artpost_id', id_art)
      .single();

    if (error)
      throw new BadRequestException(
        'Error al obtener post de arte' + error.message,
      );
    console.log(data);
    return {
      mensaje: 'Arte obtenido',
      art: data,
    };
  }

  /**
   * Borra la fila y también el archivo del bucket ART.
   *
   * Para reconstruir la ruta interna, toma la URL pública y se queda con lo
   * que está después de '/ART/'. Si la URL cambia de formato, esto se rompe.
   *
   * Nota: no borra la fila de POSTSTATS (el stat queda huérfano). Es el
   * comportamiento actual; si lo cambiás, avisalo como mejora.
   */
  async deletePost(artpost_id: string) {
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
      mensaje: 'Post eliminado con exito',
      deletedData: data,
    };
  }

  /**
   * Crea una publicación de arte con imagen.
   *
   * Orden y por qué:
   * - Primero el stat: el post necesita stats_id como FK.
   * - Después el archivo: el post necesita la URL.
   * - Por último el insert: si falla, se revierte lo anterior.
   *
   * El nombre del archivo usa el título + Date.now() para que dos subidas
   * con el mismo título no se pisen.
   */
  async postArt(user_id: string, body: any) {
    const { stat, mensaje } = await this.statsCreatorService.createStat();
    console.log(mensaje);
    console.log(stat);
    const stats_id = stat.stats_id;

    const { title, art_img, description, tags, rating } = body;

    const fileExtension = art_img.originalname.split('.').pop() || 'png';

    const filePath = `${title}-${Date.now()}.${fileExtension}`;

    const art_img_url = await this.storageService.uploadFile(
      'ART',
      filePath,
      art_img,
    );

    const { data, error } = await this.supabase
      .from('ARTPOSTS')
      .insert({
        title,
        art_img_url,
        description,
        tags,
        rating,
        user_id,
        stats_id,
      })
      .select()
      .single();

    if (error) {
      // Rollback manual: deshacer lo que ya se había creado.
      this.statsCreatorService.deleteStat(stats_id);
      this.storageService.deleteFile('ART', filePath);
      console.log(error);
      throw new BadRequestException('Error al subir info del post de Arte');
    }

    return {
      mensaje: 'Subida de arte exitosa',
      art: data,
    };
  }

  /**
   * Obras de un usuario concreto (para su perfil público).
   * Mismo patrón de paginación que la galería general.
   */
  async getUserArtPosts(user_id: string, from: number, limit: number) {
    const { data, error } = await this.supabase
      .from('ARTPOSTS')
      .select('artpost_id, title, art_img_url, rating')
      .order('created_at', { ascending: false })
      .eq('user_id', user_id)
      .range(from, from + limit);

    if (error)
      throw new BadRequestException(
        'Error al obtener posts de arte' + error.message,
      );

    return {
      mensaje: 'Arte del usuario obtenido',
      art: data,
    };
  }
}
