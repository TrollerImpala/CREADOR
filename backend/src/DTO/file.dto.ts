/**
 * file.dto.ts — Forma del archivo que entrega Multer.
 *
 * Capa: tipos auxiliares.
 * No es una clase con decoradores: es una interface de TypeScript, así que
 * no se valida en runtime. Solo describe las propiedades que usa StorageService
 * (principalmente buffer y mimetype).
 */
export interface UploadedFileDto {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}
