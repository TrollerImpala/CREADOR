/**
 * auth.service.ts — Lógica de autenticación contra Supabase Auth.
 *
 * Capa: service (lógica de negocio). El controller solo lo llama.
 *
 * Conceptos que tenés que poder explicar:
 * - auth.users es la tabla interna de Supabase donde vive el hash de la
 *   contraseña; public.USERS es la tabla de perfil del proyecto.
 * - signUp / signInWithPassword / refreshSession / signOut son métodos de
 *   Supabase Auth, no consultas SQL directas.
 * - El access token es de vida corta; el refresh token permite renovarlo.
 * - Para restablecer contraseña se usa resetPasswordForEmail (envía un mail)
 *   y luego updateUser con la sesión del usuario. No se toca USERS.
 */
import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';

import { SupabaseClient } from '@supabase/supabase-js';
//import { supabase } from "../config/supabaseClient";
import { SupabaseService } from '../sub_services/supabaseClient';
import { createClient } from '@supabase/supabase-js';

import { ConfigService } from '@nestjs/config';

import { mergeInternals } from 'rxjs/internal/operators/mergeInternals';

@Injectable()
export class AuthService {
  private readonly supabase: SupabaseClient;

  constructor(
    //private readonly supabase : SupabaseClient,
    private readonly supabaseService: SupabaseService,
  ) {
    this.supabase = this.supabaseService.getClient();
  }

  //                                  REGISTRO
  /**
   * Crea un usuario en Supabase Auth.
   *
   * Los datos de perfil (tag, nombre, descripción, redes) se guardan en
   * user_metadata dentro de auth.users. El insert a public.USERS está
   * comentado en este método, así que la fila de perfil se crea fuera de este
   * código (del lado de Supabase, por ejemplo con un trigger). Conviene
   * verificarlo en el dashboard: sin fila en USERS, el login devuelve perfil null.
   *
   * Errores: si Supabase rechaza el alta (email duplicado, password débil),
   * se traduce a BadRequestException → HTTP 400.
   */
  async register(body: any) {
    const {
      email,
      password,
      userTag,
      userName,
      userDescription,
      socialMedias,
    } = body;

    const { data: authData, error: authError } =
      await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_tag: userTag,
            user_name: userName,
            user_description: userDescription || '',
            social_medias: socialMedias || [],
          },
        },
      });

    if (authError) throw new BadRequestException(authError.message);

    // const authUserId = authData.user?.id;

    // if (!authUserId) throw new Error('No se pudo obtener el id del auth.user');

    // const { error } = await this.supabase
    // .from('USERS')
    // .insert( {
    //     id_user : authUserId,
    //     user_tag: userTag,
    //     user_name: userName,
    //     user_description: userDescription || '',
    //     user_avatar_url: avatarUrl || '',
    //     social_medias: socialMedias || []

    // } );

    // if (error) throw new BadRequestException(error.message);

    return {
      mensaje: 'Usuario registrado con exito',
      user: authData.user,
    };
  }

  //                                     LOGIN
  /**
   * Valida email + password con Supabase Auth.
   *
   * Si las credenciales son incorrectas, Supabase devuelve error y se lanza
   * UnauthorizedException → HTTP 401.
   *
   * Si son correctas:
   * - Busca el perfil en USERS por id_user (el id de auth.users).
   * - Devuelve access token, refresh token, perfil y rol.
   * - El rol sale de app_metadata.role (lo setea el administrador y el usuario
   *   no puede editarlo), con fallback a 'user'.
   */
  async login(body: any) {
    const { email, password } = body;

    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new UnauthorizedException(error.message);

    const { data: profile } = await this.supabase
      .from('USERS')
      .select('id_user, user_name, user_avatar_url')
      .eq('id_user', data.user.id)
      .single();

    return {
      mensaje: 'Usuario logeado con exito',
      user_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: profile,
      role: data.user.app_metadata?.role || 'user',
    };
  }

  /**
   * Verifica la sesión actual del cliente Supabase del backend.
   *
   * Ojo: como el backend usa la clave anon y no la sesión del navegador,
   * este método no es el que valida las peticiones del frontend. Esa
   * responsabilidad está en SupabaseAuthGuard.
   */
  async verify_session() {
    const {
      data: { session },
      error,
    } = await this.supabase.auth.getSession();

    //console.log(localStorage.getItem('access_token'));

    if (!session) throw new Error('No se ha iniciado');

    if (error || !session)
      throw new Error(
        'No se ha iniciado sesion o no se pudo refrescar el token',
      );

    return { access_token: session.access_token };
  }

  /**
   * Renueva la sesión usando el refresh token.
   *
   * Lo llama POST /api/Auth/Refresh. Si el refresh token venció o es inválido,
   * lanza UnauthorizedException → 401 y el frontend debe forzar el login.
   */
  async refresh_token(refresh_token: string) {
    if (!refresh_token) throw new Error('No se proporciono refresh token');

    const { data, error } = await this.supabase.auth.refreshSession({
      refresh_token: refresh_token,
    });

    if (error || !data.session) {
      throw new UnauthorizedException(
        'No se pudo refrescar el token, la sesión ha expirado',
      );
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  }

  // En auth.service.ts
  /**
   * Cierra la sesión en Supabase.
   *
   * Crea un cliente Supabase "como el usuario" (getUserClient) para que
   * signOut invalide la sesión correcta y no la del backend.
   *
   * El borrado de localStorage lo hace el frontend (logout.tsx).
   */
  async log_out(token: string) {
    if (!token) {
      throw new UnauthorizedException('No se proporcionó el token de acceso');
    }

    const supabaseUser = this.supabaseService.getUserClient(token);

    const { error } = await supabaseUser.auth.signOut();

    if (error) {
      throw new UnauthorizedException(
        `Error al cerrar sesión: ${error.message}`,
      );
    }

    return {
      mensaje: 'Cierre de sesión exitoso',
    };
  }
}
