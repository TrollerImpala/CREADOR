/**
 * user.service.ts — Lógica de perfiles de usuario.
 *
 * Capa: service.
 * Tabla: USERS (perfil público). La contraseña vive en auth.users, no acá.
 *
 * Este service muestra tres patrones útiles:
 * - select de columnas específicas para no exponer datos de más.
 * - validación de unicidad antes de actualizar (tag repetido).
 * - subida de archivo a Storage y guardado de la URL en la fila.
 */
import { Injectable, BadRequestException } from '@nestjs/common';

import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from '../sub_services/supabaseClient';

import { StorageService } from '../sub_services/storage.service';

@Injectable()
export class UserService {
  private readonly supabase: SupabaseClient;

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly storageService: StorageService,
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  /**
   * Perfil público: solo las columnas que pueden mostrarse a cualquiera.
   * No incluye email, redes privadas ni datos de autenticación.
   */
  async getPublicUserData(user_id: string) {
    const { data, error } = await this.supabase
      .from('USERS')
      .select('user_tag, user_name, user_description, user_avatar_url')
      .eq('id_user', user_id)
      .single();

    if (error)
      throw new BadRequestException('Error al conseguir perfil', error.message);

    const publicaciones = await this.getPublicationCounts(user_id);

    return {
    publicUser: data,
    publicaciones,
    mensaje: 'Perfil publico obtenido',
    };
  }

  async getPublicationCounts(user_id: string) {
  const [arte, musica, ofertas] = await Promise.all([
    this.supabase
      .from('ARTPOSTS')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id),
    this.supabase
      .from('MUSICPOSTS')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id),
    this.supabase
      .from('PROJECTPOSTS')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user_id),
  ]);

  if (arte.error) {
    throw new BadRequestException('Error al contar arte', arte.error.message);
  }
  if (musica.error) {
    throw new BadRequestException('Error al contar música', musica.error.message);
  }
  if (ofertas.error) {
    throw new BadRequestException('Error al contar ofertas', ofertas.error.message);
  }

  const conteoArte = arte.count ?? 0;
  const conteoMusica = musica.count ?? 0;
  const conteoOfertas = ofertas.count ?? 0;

  return {
    arte: conteoArte,
    musica: conteoMusica,
    ofertas: conteoOfertas,
    total: conteoArte + conteoMusica + conteoOfertas,
  };
}

  /**
   * Perfil propio: select() sin columnas trae todas las columnas de USERS.
   * Solo se llama con el id que vino del token.
   */
  async getUserData(user_id: string) {
    const { data, error } = await this.supabase
      .from('USERS')
      .select()
      .eq('id_user', user_id)
      .single();

    if (error)
      throw new BadRequestException('Error al conseguir perfil', error.message);

    return {
      user: data,
      mensaje: 'Perfil obtenido',
    };
  }

  /**
   * Actualiza el perfil del usuario autenticado.
   *
   * Pasos:
   * 1. Verificar que el tag no esté usado por otro usuario (.neq excluye
   *    al propio usuario).
   * 2. Si hay avatar, subirlo a Storage y quedarse con la URL.
   * 3. Actualizar la fila y devolverla.
   *
   * No se actualiza el email ni la contraseña: eso es competencia de
   * Supabase Auth, no de la tabla USERS.
   */
  async updateUser(user_id: string, body: any) {
    const { userTag, userName, userDescription, avatar_img, socialMedias } =
      body;

    const { data: userTagVerif, error: errorTagVerif } = await this.supabase
      .from('USERS')
      .select()
      .eq('user_tag', userTag)
      .neq('id_user', user_id);

    if (errorTagVerif)
      throw new BadRequestException(
        'Error al verificar tag',
        errorTagVerif.message,
      );

    // Si encontró otra fila con ese tag, el tag ya está ocupado.
    if (userTagVerif && userTagVerif.length > 0)
      throw new BadRequestException('Tag ya existente, elije otro');

    let avatarUrl;

    if (avatar_img) {
      // La ruta incluye el id para evitar colisiones de nombres.
      const avatarPath = `AVATARS/${user_id}_${avatar_img.originalname}`;
      avatarUrl = await this.storageService.uploadFile(
        'USERS',
        avatarPath,
        avatar_img,
      );
    }

    const { data, error } = await this.supabase
      .from('USERS')
      .update({
        user_tag: userTag,
        user_name: userName,
        user_description: userDescription || '',
        // Si no se subió avatar nuevo, avatarUrl es undefined y la columna
        // no se modifica (Supabase ignora undefined en el update).
        user_avatar_url: avatarUrl,
        social_medias: socialMedias || [],
      })
      .eq('id_user', user_id)
      .select()
      .single();

    if (error)
      throw new BadRequestException(
        'Error al actualizar perfil',
        error.message,
      );

    return {
      mensaje: `Usuario ${userTag} Actualizado`,
      user: data,
    };
  }
}
