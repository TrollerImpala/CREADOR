/**
 * general_posts.controller.ts — Borrado unificado de publicaciones.
 *
 * Capa: controller.
 * En vez de tener un DELETE en cada módulo, el frontend llama a esta única
 * ruta y le indica el tipo de post por query string.
 *
 * Ruta: DELETE /api/GeneralPosts/Deleteposts/:id?tipo=arte|musica|JobOfferta
 * Requiere token: el guard deja req.user para validar dueño o moderador.
 */
import {
  Delete,
  Controller,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { GeneralPostsService } from './general_posts.service';

@Controller('GeneralPosts')
export class generalPostscontroller {
  constructor(private readonly generalpostservice: GeneralPostsService) {}

  @Delete('Deleteposts/:id')
  @UseGuards(SupabaseAuthGuard)
  async deletpost(
    // tipo llega por query: ?tipo=arte
    @Query('tipo') tipo: string,
    // id del post llega por la URL: /Deleteposts/<id>
    @Param('id') id_post: string,
    @Req() req: Record<string, any>,
  ) {
    // req.user = { id, email, role } lo setea SupabaseAuthGuard.
    const user = req.user;
    return await this.generalpostservice.DeletPost(id_post, tipo, user);
  }
}
