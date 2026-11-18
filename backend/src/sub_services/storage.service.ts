/**
 * storage.service.ts — Subida y borrado de archivos en Supabase Storage.
 *
 * Capa: sub_services (infraestructura).
 * Lo usan los services de arte, música, usuarios, etc. para guardar imágenes
 * y audio. El archivo NO se guarda en PostgreSQL: en la base solo queda la URL.
 *
 * Flujo típico de una subida (ver art.service.ts):
 * 1. El controller recibe multipart/form-data con FileInterceptor.
 * 2. El service llama a uploadFile(bucket, path, file).
 * 3. Supabase guarda el archivo y devuelve una URL pública.
 * 4. El service inserta esa URL en la tabla correspondiente.
 *
 * El bucket debe existir en Supabase y tener políticas que permitan la
 * operación; si no, la subida falla aunque el código esté bien.
 */
import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';

import { SupabaseService } from './supabaseClient';

import type { UploadedFileDto } from '../DTO/file.dto';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor(supabaseService: SupabaseService) {
    this.supabase = supabaseService.getClient();
  }

  /**
   * Sube un archivo y devuelve su URL pública.
   *
   * @param bucket nombre del bucket en Supabase Storage (ej. 'USERS')
   * @param path ruta interna del archivo (ej. 'arte/uuid.png')
   * @param file archivo que dejó Multer: buffer + mimetype
   *
   * upsert: true sobrescribe si ya existe un archivo en esa ruta.
   */
  async uploadFile(
    bucket: string,
    path: string,
    file: UploadedFileDto,
  ): Promise<string> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error)
      throw new BadRequestException(`Error al subir archivo: ${error.message}`);

    return this.getPublicUrl(bucket, path);
  }

  /**
   * Construye la URL pública de un archivo ya subido.
   * No hace una petición HTTP: solo arma la ruta según el bucket.
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);

    return data.publicUrl;
  }

  /**
   * Borra un archivo del bucket.
   * Se usa, por ejemplo, al eliminar un post para no dejar archivos huérfanos.
   */
  async deleteFile(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage.from(bucket).remove([path]);

    if (error)
      throw new BadRequestException(
        `Error al eliminar imagen: ${error.message}`,
      );
  }
}
