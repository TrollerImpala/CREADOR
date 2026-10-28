import { BadRequestException } from '@nestjs/common';
import { ArtService } from './art.service';

type QueryResult = { data: any; error: any };

// Query builder de Supabase falso: cada método de la cadena devuelve el mismo builder
// y, al hacer await, resuelve con { data, error } (igual que PostgrestBuilder).
const createQueryBuilder = (result: QueryResult) => {
  const builder: any = {};
  ['select', 'order', 'range', 'eq', 'delete', 'insert', 'single'].forEach((method) => {
    builder[method] = jest.fn().mockReturnValue(builder);
  });
  builder.then = (resolve: (value: QueryResult) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return builder;
};

describe('ArtService', () => {
  let service: ArtService;
  let supabase: { from: jest.Mock };
  let storageService: { uploadFile: jest.Mock; deleteFile: jest.Mock };
  let generalPostsService: { createStat: jest.Mock; deleteStat: jest.Mock };

  // Hace que la próxima consulta a Supabase devuelva { data, error } y expone el builder para inspeccionarlo.
  const queryReturns = (result: QueryResult) => {
    const builder = createQueryBuilder(result);
    supabase.from.mockReturnValue(builder);
    return builder;
  };

  beforeEach(() => {
    // El service hace console.log de stats y errores: se silencia para no ensuciar la salida.
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    supabase = { from: jest.fn() };
    storageService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn().mockResolvedValue(undefined),
    };
    generalPostsService = {
      createStat: jest.fn(),
      deleteStat: jest.fn().mockResolvedValue(undefined),
    };

    service = new ArtService(
      { getClient: () => supabase } as any,
      storageService as any,
      generalPostsService as any,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('getArtPosts', () => {
    it('consulta ARTPOSTS ordenado por fecha descendente y devuelve los posts', async () => {
      const posts = [
        { artpost_id: '1', title: 'Ilustración Gothic', art_img_url: 'url1', rating: 'G' },
        { artpost_id: '2', title: 'Cyberpunk Art', art_img_url: 'url2', rating: 'PG' },
      ];
      const builder = queryReturns({ data: posts, error: null });

      const result = await service.getArtPosts(0, 10);

      expect(supabase.from).toHaveBeenCalledWith('ARTPOSTS');
      expect(builder.select).toHaveBeenCalledWith('artpost_id, title, art_img_url, rating');
      expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual({ mensaje: 'Arte obtenido', art: posts });
    });

    it('pide el rango (from, from + limit)', async () => {
      // OJO: range() de Supabase es inclusivo, así que range(0, 10) trae 11 filas.
      // Este test documenta el comportamiento actual del service.
      const builder = queryReturns({ data: [], error: null });

      await service.getArtPosts(20, 5);

      expect(builder.range).toHaveBeenCalledWith(20, 25);
    });

    it('lanza BadRequestException con el detalle si Supabase devuelve error', async () => {
      queryReturns({ data: null, error: { message: 'boom' } });

      await expect(service.getArtPosts(0, 10)).rejects.toThrow(BadRequestException);
      await expect(service.getArtPosts(0, 10)).rejects.toThrow('boom');
    });
  });

  // ---------------------------------------------------------------------------
  describe('getArtPost', () => {
    it('busca el post por id y devuelve un único resultado', async () => {
      const post = { artpost_id: 'abc', title: 'Ilustración Gothic', rating: 'G' };
      const builder = queryReturns({ data: post, error: null });

      const result = await service.getArtPost('abc');

      expect(supabase.from).toHaveBeenCalledWith('ARTPOSTS');
      expect(builder.eq).toHaveBeenCalledWith('artpost_id', 'abc');
      expect(builder.single).toHaveBeenCalled();
      expect(result).toEqual({ mensaje: 'Arte obtenido', art: post });
    });

    it('lanza BadRequestException si el post no existe o la consulta falla', async () => {
      queryReturns({ data: null, error: { message: 'no rows' } });

      await expect(service.getArtPost('999')).rejects.toThrow(BadRequestException);
      await expect(service.getArtPost('999')).rejects.toThrow('no rows');
    });
  });

  // ---------------------------------------------------------------------------
  describe('deletePost', () => {
    const deletedRow = {
      artpost_id: '1',
      title: 'Obra',
      art_img_url: 'https://proyecto.supabase.co/storage/v1/object/public/ART/obra-123.png',
    };

    it('elimina el registro y borra la imagen del bucket ART', async () => {
      const builder = queryReturns({ data: deletedRow, error: null });

      const result = await service.deletePost('1');

      expect(supabase.from).toHaveBeenCalledWith('ARTPOSTS');
      expect(builder.delete).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenCalledWith('artpost_id', '1');
      expect(storageService.deleteFile).toHaveBeenCalledWith('ART', 'obra-123.png');
      expect(result).toEqual({ mensaje: 'Post eliminado con exito', deletedData: deletedRow });
    });

    it('lanza BadRequestException y no toca el storage si falla el borrado en la base', async () => {
      queryReturns({ data: null, error: { message: 'fk violation' } });

      await expect(service.deletePost('1')).rejects.toThrow(BadRequestException);
      await expect(service.deletePost('1')).rejects.toThrow('Error al eliminar el Arte');
      expect(storageService.deleteFile).not.toHaveBeenCalled();
    });

    it('no intenta borrar ningún archivo si la url no trae nombre de archivo', async () => {
      const row = { ...deletedRow, art_img_url: 'https://proyecto.supabase.co/storage/v1/object/public/ART/' };
      queryReturns({ data: row, error: null });

      const result = await service.deletePost('1');

      expect(storageService.deleteFile).not.toHaveBeenCalled();
      expect(result.deletedData).toEqual(row);
    });
  });

  // ---------------------------------------------------------------------------
  describe('postArt', () => {
    const NOW = 1700000000000;
    const IMAGE_URL = 'https://proyecto.supabase.co/storage/v1/object/public/ART/Mi Obra-1700000000000.png';

    const buildBody = (originalname = 'foto.png') => ({
      title: 'Mi Obra',
      description: 'Una descripción',
      tags: ['digital', 'gothic'],
      rating: 'G',
      art_img: { originalname, mimetype: 'image/png', buffer: Buffer.from('fake-image-bytes') },
    });

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(NOW);
      generalPostsService.createStat.mockResolvedValue({
        mensaje: 'Stat creada',
        stat: { stats_id: 'stats-1' },
      });
      storageService.uploadFile.mockResolvedValue(IMAGE_URL);
    });

    it('crea la stat, sube la imagen e inserta el post con todos sus campos', async () => {
      const body = buildBody();
      const savedPost = { artpost_id: '123', title: 'Mi Obra' };
      const builder = queryReturns({ data: savedPost, error: null });

      const result = await service.postArt('user-1', body);

      expect(generalPostsService.createStat).toHaveBeenCalledTimes(1);
      expect(storageService.uploadFile).toHaveBeenCalledWith('ART', 'Mi Obra-1700000000000.png', body.art_img);
      expect(supabase.from).toHaveBeenCalledWith('ARTPOSTS');
      expect(builder.insert).toHaveBeenCalledWith({
        title: 'Mi Obra',
        art_img_url: IMAGE_URL,
        description: 'Una descripción',
        tags: ['digital', 'gothic'],
        rating: 'G',
        user_id: 'user-1',
        stats_id: 'stats-1',
      });
      expect(result).toEqual({ mensaje: 'Subida de arte exitosa', art: savedPost });
    });

    const extensionCases: Array<[string, string]> = [
      ['foto.jpeg', 'jpeg'],
      ['imagen.', 'png'], // sin extensión: usa png por defecto
    ];

    extensionCases.forEach(([originalname, extension]) => {
      it(`arma el nombre del archivo con la extensión "${extension}" para "${originalname}"`, async () => {
        queryReturns({ data: { artpost_id: '123' }, error: null });

        await service.postArt('user-1', buildBody(originalname));

        expect(storageService.uploadFile).toHaveBeenCalledWith(
          'ART',
          `Mi Obra-1700000000000.${extension}`,
          expect.anything(),
        );
      });
    });

    it('si falla el insert, limpia la stat y la imagen subida y lanza BadRequestException', async () => {
      queryReturns({ data: null, error: { message: 'insert failed' } });

      const promise = service.postArt('user-1', buildBody());

      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      await expect(promise).rejects.toThrow('Error al subir info del post de Arte');
      expect(generalPostsService.deleteStat).toHaveBeenCalledWith('stats-1');
      expect(storageService.deleteFile).toHaveBeenCalledWith('ART', 'Mi Obra-1700000000000.png');
    });

    it('si falla la subida de la imagen, propaga el error y no inserta el post', async () => {
      storageService.uploadFile.mockRejectedValue(new Error('storage down'));

      await expect(service.postArt('user-1', buildBody())).rejects.toThrow('storage down');
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('si falla la creación de la stat, propaga el error y no sube nada', async () => {
      generalPostsService.createStat.mockRejectedValue(new Error('stat failed'));

      await expect(service.postArt('user-1', buildBody())).rejects.toThrow('stat failed');
      expect(storageService.uploadFile).not.toHaveBeenCalled();
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });
});
