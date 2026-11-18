/**
 * user.controller.ts — Rutas HTTP de perfiles.
 *
 * Capa: controller.
 * Base: /api/Users.
 *
 * Endpoints:
 * - GET  /api/Users/Usuario/:user_id  → perfil público (sin token)
 * - POST /api/Users/Perfil            → perfil propio completo (con token)
 * - PUT  /api/Users/ActualizarPerfil  → editar perfil + avatar (con token)
 *
 * Diferencia importante:
 * - El perfil público no expone datos sensibles.
 * - El perfil propio se identifica por el token, no por un id del body:
 *   así nadie puede leer el perfil privado de otro cambiando la URL.
 */
import {
  Controller,
  Post,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';

import { SupabaseAuthGuard } from '../guards/auth.guard';

import { FileInterceptor } from '@nestjs/platform-express';

import { UserDto } from '../DTO/user.dto';

@Controller('Users')
export class UsersController {
  constructor(private readonly userService: UserService) {}

  // Público: cualquiera puede ver tag, nombre, descripción y avatar.
  @Get('Usuario/:user_id')
  async getUser(@Param('user_id') user_id: string) {
    return await this.userService.getPublicUserData(user_id);
  }

  // Privado: el id sale del token validado por el guard.
  @Post('Perfil')
  @UseGuards(SupabaseAuthGuard)
  async getProfile(@Req() req: any) {
    const userId = req.user.id;

    return this.userService.getUserData(userId);
  }

  // Actualización con archivo opcional.
  // FileInterceptor('profile_img') procesa multipart/form-data y deja el
  // archivo en @UploadedFile(). El resto de los campos llega en @Body().
  @Put('ActualizarPerfil')
  @UseGuards(SupabaseAuthGuard)
  @UseInterceptors(FileInterceptor('profile_img'))
  async updateProfile(
    @Req() req: any,
    @Body() body: UserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = req.user.id;

    // Se arma un payload propio para no pasar el DTO crudo al service.
    const postPayLoad = {
      userTag: body.userTag,
      userName: body.userName,
      userDescription: body.userDescription,
      avatar_img: file ? file : null,
      socialMedias: body.socialMedias || [],
    };

    return this.userService.updateUser(userId, postPayLoad);
  }
}
