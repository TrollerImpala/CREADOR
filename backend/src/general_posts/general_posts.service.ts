import { ArtService } from '../art/art.service';
import { MusicService } from '../music/music.service';
import { JobOfferService } from '../jobOffers/job-offer.service';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../sub_services/supabaseClient';

@Injectable()
export class GeneralPostsService {
  private readonly supabase;

  constructor(
    private readonly artService: ArtService,
    private readonly musicService: MusicService,
    private readonly jobOfferService: JobOfferService,
    private readonly supabaseService: SupabaseService,
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  async DeletPost(post_id: string, tipo: string, user: any) {
    let tableName = '';
    let idColumn = '';

    switch (tipo) {
      case 'arte':
        tableName = 'ARTPOSTS';
        idColumn = 'artpost_id';
        break;
      case 'musica':
        tableName = 'MUSICPOSTS';
        idColumn = 'song_id';
        break;
      case 'JobOfferta':
        tableName = 'PROJECTPOSTS';
        idColumn = 'project_id';
        break;
      default:
        throw new ForbiddenException('Tipo de post inválido');
    }

    // 1. Buscar el post para obtener su creador (user_id) y verificar que exista
    const { data: post, error } = await this.supabase
      .from(tableName)
      .select('user_id')
      .eq(idColumn, post_id)
      .single();

    if (error || !post) {
      console.error('Error al buscar el post en Supabase:', error);
      throw new ForbiddenException('El post no existe o no se pudo encontrar');
    }

    // 2. Obtener el rol del usuario autenticado
    const rol = user?.role ? String(user.role).toLowerCase().trim() : '';
    const tienePermisoEspecial = rol === 'moderator';

    // 3. Verificar si el usuario actual es el dueño del post
    const postOwnerId = String(post.user_id || '').trim();
    // Probamos las propiedades comunes donde puede venir el ID del usuario en el token
    const currentUserId = String(
      user?.id || user?.userId || user?.sub || '',
    ).trim();

    const esDueño =
      postOwnerId !== '' &&
      currentUserId !== '' &&
      postOwnerId === currentUserId;

    console.log(`--- VALIDACIÓN DE BORRADO ---`);
    console.log(`Dueño del post en BD: ${postOwnerId}`);
    console.log(`Usuario actual logueado: ${currentUserId}`);
    console.log(`¿Es Dueño?: ${esDueño}`);
    console.log(
      `¿Tiene permiso especial (Admin/Mod)?: ${tienePermisoEspecial}`,
    );

    // 4. Validar permisos: Se permite si es Administrador/Moderador O si es el dueño del post
    if (!tienePermisoEspecial && !esDueño) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar este post',
      );
    }

    // 5. Ejecutar el borrado correspondiente según el tipo
    switch (tipo) {
      case 'arte':
        return await this.artService.deletePost(post_id);
      case 'musica':
        return await this.musicService.deletePost(post_id);
      case 'JobOfferta':
        return await this.jobOfferService.deletePost(post_id);
    }
  }
}
