import { Injectable, BadRequestException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { SupabaseService } from './supabaseClient';

import type { UploadedFileDto } from '../DTO/file.dto';

@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor(supabaseService : SupabaseService) {
    this.supabase = supabaseService.getClient();
  }

  async uploadFile(bucket : string, path : string, file : UploadedFileDto): Promise<string> {

    const { error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: true,
      });

    if (error) throw new BadRequestException(`Error al subir archivo: ${error.message}`);

    return this.getPublicUrl(bucket, path);
  }

  getPublicUrl(bucket : string, path : string): string {

    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);

    return data.publicUrl;
  }

  async deleteFile(bucket : string, path : string): Promise<void> {

    const { error } = await this.supabase.storage.from(bucket).remove([path]);

    if (error) throw new BadRequestException(`Error al eliminar imagen: ${error.message}`);
  }
}