import { BadRequestException } from '@nestjs/common';
import { MusicService } from './music.service';

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

describe('MusicService', () => {
  let service: MusicService;
  let supabase: { from: jest.Mock };
  let supabaseService: { getClient: jest.Mock };
  let storageService: { uploadFile: jest.Mock; deleteFile: jest.Mock };
  let statsCreatorService: { createStat: jest.Mock; deleteStat: jest.Mock };

  // Hace que la próxima consulta a Supabase devuelva { data, error } y expone el builder para inspeccionarlo.
  const queryReturns = (result: QueryResult) => {
    const builder = createQueryBuilder(result);
    supabase.from.mockReturnValue(builder);
    return builder;
  };

  beforeEach(() => {
    // postSong hace console.log de la stat: se silencia para no ensuciar la salida.
    // OJO: console.error NO se mockea, porque deletePost hace `throw new console.error(...)` (ver más abajo).
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    supabase = { from: jest.fn() };
    supabaseService = { getClient: jest.fn().mockReturnValue(supabase) };
    storageService = {
      uploadFile: jest.fn(),
      deleteFile: jest.fn().mockResolvedValue(undefined),
    };
    statsCreatorService = {
      createStat: jest.fn(),
      deleteStat: jest.fn().mockResolvedValue(undefined),
    };

    service = new MusicService(supabaseService as any, storageService as any, statsCreatorService as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ---------------------------------------------------------------------------
  describe('constructor', () => {
    it('obtiene el cliente de Supabase del SupabaseService', () => {
      expect(supabaseService.getClient).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  describe('getMusicPosts', () => {
    it('consulta MUSICPOSTS ordenado por fecha descendente y devuelve las canciones', async () => {
      const songs = [
        { song_id: '1', song_name: 'Tema 1', song_url: 'u1', song_cover_url: 'c1', rating: 'G' },
        { song_id: '2', song_name: 'Tema 2', song_url: 'u2', song_cover_url: 'c2', rating: 'PG' },
      ];
      const builder = queryReturns({ data: songs, error: null });

      const result = await service.getMusicPosts(0, 10);

      expect(supabase.from).toHaveBeenCalledWith('MUSICPOSTS');
      expect(builder.select).toHaveBeenCalledWith('song_id, song_name, song_url, song_cover_url, rating');
      expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual({ mensaje: 'Musica obtenida', songs });
    });

    it('pide el rango (from, from + limit)', async () => {
      // OJO: range() de Supabase es inclusivo, así que range(0, 10) trae 11 filas.
      // Este test documenta el comportamiento actual del service.
      const builder = queryReturns({ data: [], error: null });

      await service.getMusicPosts(20, 5);

      expect(builder.range).toHaveBeenCalledWith(20, 25);
    });

    it('lanza BadRequestException con el detalle si Supabase devuelve error', async () => {
      queryReturns({ data: null, error: { message: 'boom' } });

      await expect(service.getMusicPosts(0, 10)).rejects.toThrow(BadRequestException);
      await expect(service.getMusicPosts(0, 10)).rejects.toThrow('Error al obtener posts de musica');
      await expect(service.getMusicPosts(0, 10)).rejects.toThrow('boom');
    });
  });

  // ---------------------------------------------------------------------------
  describe('getUserMusicPosts', () => {
    it('filtra por user_id, ordena por fecha descendente y devuelve las canciones del usuario', async () => {
      const songs = [{ song_id: '1', song_name: 'Tema 1', song_url: 'u1', song_cover_url: 'c1', rating: 'G' }];
      const builder = queryReturns({ data: songs, error: null });

      const result = await service.getUserMusicPosts('user-1', 0, 10);

      expect(supabase.from).toHaveBeenCalledWith('MUSICPOSTS');
      expect(builder.select).toHaveBeenCalledWith('song_id, song_name, song_url, song_cover_url, rating');
      expect(builder.eq).toHaveBeenCalledWith('user_id', 'user-1');
      expect(builder.order).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(builder.range).toHaveBeenCalledWith(0, 10);
      expect(result).toEqual({ mensaje: 'Musica de usuario obtenida', songs });
    });

    it('lanza BadRequestException con el detalle si Supabase devuelve error', async () => {
      queryReturns({ data: null, error: { message: 'boom' } });

      await expect(service.getUserMusicPosts('user-1', 0, 10)).rejects.toThrow(BadRequestException);
      await expect(service.getUserMusicPosts('user-1', 0, 10)).rejects.toThrow(
        'Error al obtener posts de musica del usuario',
      );
      await expect(service.getUserMusicPosts('user-1', 0, 10)).rejects.toThrow('boom');
    });
  });

  // ---------------------------------------------------------------------------
  describe('getMusicPost', () => {
    it('busca la canción por song_id junto con los datos del usuario y devuelve un único resultado', async () => {
      const song = { song_id: 'abc', song_name: 'Tema', USERS: { user_name: 'Ana', user_tag: 'ana', user_avatar_url: 'a' } };
      const builder = queryReturns({ data: song, error: null });

      const result = await service.getMusicPost('abc');

      expect(supabase.from).toHaveBeenCalledWith('MUSICPOSTS');
      expect(builder.select).toHaveBeenCalledWith('*, USERS(user_name, user_tag, user_avatar_url)');
      expect(builder.eq).toHaveBeenCalledWith('song_id', 'abc');
      expect(builder.single).toHaveBeenCalled();
      expect(result).toEqual({ mensaje: 'Cancion obtenida', song });
    });

    it('lanza BadRequestException si la canción no existe o la consulta falla', async () => {
      queryReturns({ data: null, error: { message: 'no rows' } });

      await expect(service.getMusicPost('999')).rejects.toThrow(BadRequestException);
      await expect(service.getMusicPost('999')).rejects.toThrow('Error al obtener post de musica');
      await expect(service.getMusicPost('999')).rejects.toThrow('no rows');
    });
  });

  // ---------------------------------------------------------------------------
  describe('postSong', () => {
    const NOW = 1700000000000;

    const buildBody = (coverName = 'portada.jpg', songName = 'tema.mp3') => ({
      song_name: 'Tema',
      song_description: 'Una descripción',
      tags: ['rock', 'pop'],
      rating: 'G',
      song_cover_img: { originalname: coverName, mimetype: 'image/jpeg', buffer: Buffer.from('cover') },
      song_file: { originalname: songName, mimetype: 'audio/mpeg', buffer: Buffer.from('audio') },
    });

    beforeEach(() => {
      jest.spyOn(Date, 'now').mockReturnValue(NOW);
      statsCreatorService.createStat.mockResolvedValue({
        mensaje: 'Stat creada',
        stat: { stats_id: 'stats-1' },
      });
      // Devuelve una url que contiene la ruta del archivo, como hace el bucket real.
      storageService.uploadFile.mockImplementation(async (bucket: string, path: string) => `https://cdn/${bucket}/${path}`);
    });

    it('crea la stat, sube portada y canción al bucket MUSIC e inserta el post con todos sus campos', async () => {
      const body = buildBody();
      const saved = { song_id: '123', song_name: 'Tema' };
      const builder = queryReturns({ data: saved, error: null });

      const result = await service.postSong('user-1', body);

      expect(statsCreatorService.createStat).toHaveBeenCalledTimes(1);
      expect(storageService.uploadFile).toHaveBeenCalledTimes(2);
      // La portada se sube primero y la canción después
      expect(storageService.uploadFile.mock.calls[0]).toEqual([
        'MUSIC',
        'SONGCOVERS/TemaCover-1700000000000.jpg',
        body.song_cover_img,
      ]);
      expect(storageService.uploadFile.mock.calls[1]).toEqual([
        'MUSIC',
        'SONGS/TemaSong-1700000000000.mp3',
        body.song_file,
      ]);
      expect(supabase.from).toHaveBeenCalledWith('MUSICPOSTS');
      expect(builder.insert).toHaveBeenCalledWith({
        song_url: 'https://cdn/MUSIC/SONGS/TemaSong-1700000000000.mp3',
        song_name: 'Tema',
        song_description: 'Una descripción',
        user_id: 'user-1',
        song_cover_url: 'https://cdn/MUSIC/SONGCOVERS/TemaCover-1700000000000.jpg',
        stats_id: 'stats-1',
        tags: ['rock', 'pop'],
        rating: 'G',
      });
      expect(result).toEqual({ mensaje: 'Subida de musica exitosa', song: saved });
    });

    it('usa la extensión "png" si los archivos no tienen extensión', async () => {
      queryReturns({ data: { song_id: '123' }, error: null });

      await service.postSong('user-1', buildBody('portada.', 'tema.'));

      expect(storageService.uploadFile.mock.calls[0][1]).toBe('SONGCOVERS/TemaCover-1700000000000.png');
      expect(storageService.uploadFile.mock.calls[1][1]).toBe('SONGS/TemaSong-1700000000000.png');
    });

    it('si falla el insert, limpia la stat y los dos archivos subidos y lanza BadRequestException', async () => {
      queryReturns({ data: null, error: { message: 'insert failed' } });

      const promise = service.postSong('user-1', buildBody());

      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      await expect(promise).rejects.toThrow('Error al subir info del post de Musica: insert failed');
      expect(statsCreatorService.deleteStat).toHaveBeenCalledWith('stats-1');
      expect(storageService.deleteFile).toHaveBeenCalledWith('MUSIC', 'SONGCOVERS/TemaCover-1700000000000.jpg');
      expect(storageService.deleteFile).toHaveBeenCalledWith('MUSIC', 'SONGS/TemaSong-1700000000000.mp3');
    });

    it('si falla la creación de la stat, propaga el error y no sube nada', async () => {
      statsCreatorService.createStat.mockRejectedValue(new Error('stat failed'));

      await expect(service.postSong('user-1', buildBody())).rejects.toThrow('stat failed');
      expect(storageService.uploadFile).not.toHaveBeenCalled();
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('si falla la subida de la portada, propaga el error y no sube la canción ni inserta el post', async () => {
      storageService.uploadFile.mockRejectedValue(new Error('storage down'));

      await expect(service.postSong('user-1', buildBody())).rejects.toThrow('storage down');
      expect(storageService.uploadFile).toHaveBeenCalledTimes(1);
      expect(supabase.from).not.toHaveBeenCalled();
    });

    it('si falla la subida de la canción, propaga el error y no inserta el post', async () => {
      storageService.uploadFile
        .mockResolvedValueOnce('https://cdn/MUSIC/SONGCOVERS/cover.jpg')
        .mockRejectedValueOnce(new Error('song upload failed'));

      await expect(service.postSong('user-1', buildBody())).rejects.toThrow('song upload failed');
      expect(storageService.uploadFile).toHaveBeenCalledTimes(2);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  describe('deletePost', () => {
    const BASE = 'https://proyecto.supabase.co/storage/v1/object/public/MUSIC';
    const deletedRow = {
      song_id: '1',
      song_name: 'Tema',
      song_url: `${BASE}/SONGS/tema-123.mp3`,
      song_cover_url: `${BASE}/SONGCOVERS/portada-123.jpg`,
    };

    it('elimina el registro y borra del bucket MUSIC la canción y la portada', async () => {
      const builder = queryReturns({ data: deletedRow, error: null });

      const result = await service.deletePost('1');

      expect(supabase.from).toHaveBeenCalledWith('MUSICPOSTS');
      expect(builder.delete).toHaveBeenCalled();
      expect(builder.eq).toHaveBeenCalledWith('song_id', '1');
      expect(builder.single).toHaveBeenCalled();
      expect(storageService.deleteFile).toHaveBeenCalledTimes(2);
      expect(storageService.deleteFile).toHaveBeenCalledWith('MUSIC', 'SONGS/tema-123.mp3');
      expect(storageService.deleteFile).toHaveBeenCalledWith('MUSIC', 'SONGCOVERS/portada-123.jpg');
      expect(result).toEqual({ mensaje: 'Post eliminado con exito', deletedData: deletedRow });
    });

    it('lanza un error y no toca el storage si falla el borrado en la base', async () => {
      // OJO: hoy el service hace `throw new console.error(...)`, que lanza un TypeError
      // ("console.error is not a constructor") en vez de una BadRequestException.
      // Por eso acá solo se comprueba que lanza algún error; si se corrige a BadRequestException, sigue pasando.
      queryReturns({ data: null, error: { message: 'no rows' } });

      await expect(service.deletePost('1')).rejects.toThrow();
      expect(storageService.deleteFile).not.toHaveBeenCalled();
    });

    it('no intenta borrar la canción si la url no trae nombre de archivo, pero sí la portada', async () => {
      const row = { ...deletedRow, song_url: `${BASE}/` };
      queryReturns({ data: row, error: null });

      await service.deletePost('1');

      expect(storageService.deleteFile).toHaveBeenCalledTimes(1);
      expect(storageService.deleteFile).toHaveBeenCalledWith('MUSIC', 'SONGCOVERS/portada-123.jpg');
    });

    it('no intenta borrar la portada si la url no trae nombre de archivo, pero sí la canción', async () => {
      const row = { ...deletedRow, song_cover_url: `${BASE}/` };
      queryReturns({ data: row, error: null });

      await service.deletePost('1');

      expect(storageService.deleteFile).toHaveBeenCalledTimes(1);
      expect(storageService.deleteFile).toHaveBeenCalledWith('MUSIC', 'SONGS/tema-123.mp3');
    });
  });
});
