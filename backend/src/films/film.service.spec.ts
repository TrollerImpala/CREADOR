import { BadRequestException } from '@nestjs/common';
import { FilmService } from './film.service';

type QueryResult = { data: any; error: any };

// Query builder de Supabase falso: cada método de la cadena devuelve el mismo builder
// y, al hacer await, resuelve con { data, error } (igual que PostgrestBuilder).
const createQueryBuilder = (result: QueryResult) => {
  const builder: any = {};
  ['select', 'eq', 'single'].forEach((method) => {
    builder[method] = jest.fn().mockReturnValue(builder);
  });
  builder.then = (resolve: (value: QueryResult) => unknown, reject: (reason: unknown) => unknown) =>
    Promise.resolve(result).then(resolve, reject);
  return builder;
};

describe('FilmService', () => {
  let service: FilmService;
  let supabase: { from: jest.Mock };
  let supabaseService: { getClient: jest.Mock };

  // Hace que la próxima consulta a Supabase devuelva { data, error } y expone el builder para inspeccionarlo.
  const queryReturns = (result: QueryResult) => {
    const builder = createQueryBuilder(result);
    supabase.from.mockReturnValue(builder);
    return builder;
  };

  beforeEach(() => {
    supabase = { from: jest.fn() };
    supabaseService = { getClient: jest.fn().mockReturnValue(supabase) };

    // El segundo parámetro es el StorageService: el service no lo usa todavía.
    service = new FilmService(supabaseService as any, {} as any);
  });

  // ---------------------------------------------------------------------------
  describe('constructor', () => {
    it('obtiene el cliente de Supabase del SupabaseService', () => {
      expect(supabaseService.getClient).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  describe('getFilmPosts', () => {
    it('consulta FILMPOSTS con las columnas del listado y devuelve los filmes', async () => {
      const films = [
        { film_id: '1', film_title: 'Metropolis', film_thumbnail_url: 'url1', rating: 'G' },
        { film_id: '2', film_title: 'Blade Runner', film_thumbnail_url: 'url2', rating: 'R' },
      ];
      const builder = queryReturns({ data: films, error: null });

      const result = await service.getFilmPosts();

      expect(supabase.from).toHaveBeenCalledWith('FILMPOSTS');
      expect(builder.select).toHaveBeenCalledWith('film_id, film_title, film_thumbnail_url, rating');
      expect(result).toEqual({ mensaje: 'Filmes obtenidos', films });
    });

    it('devuelve una lista vacía si no hay filmes', async () => {
      queryReturns({ data: [], error: null });

      const result = await service.getFilmPosts();

      expect(result).toEqual({ mensaje: 'Filmes obtenidos', films: [] });
    });

    it('lanza BadRequestException con el detalle si Supabase devuelve error', async () => {
      queryReturns({ data: null, error: { message: 'boom' } });

      await expect(service.getFilmPosts()).rejects.toThrow(BadRequestException);
      await expect(service.getFilmPosts()).rejects.toThrow('Error al obtener posts de filmes');
      await expect(service.getFilmPosts()).rejects.toThrow('boom');
    });
  });

  // ---------------------------------------------------------------------------
  describe('getFilmPost', () => {
    it('busca el filme por film_id y devuelve un único resultado', async () => {
      const film = { film_id: 'abc', film_title: 'Metropolis', rating: 'G' };
      const builder = queryReturns({ data: film, error: null });

      const result = await service.getFilmPost('abc');

      expect(supabase.from).toHaveBeenCalledWith('FILMPOSTS');
      expect(builder.eq).toHaveBeenCalledWith('film_id', 'abc');
      expect(builder.single).toHaveBeenCalled();
      expect(result).toEqual({ mensaje: 'Filme obtenido', film });
    });

    it('lanza BadRequestException si el filme no existe o la consulta falla', async () => {
      queryReturns({ data: null, error: { message: 'no rows' } });

      await expect(service.getFilmPost('999')).rejects.toThrow(BadRequestException);
      await expect(service.getFilmPost('999')).rejects.toThrow('Error al obtener post de filmes');
      await expect(service.getFilmPost('999')).rejects.toThrow('no rows');
    });
  });
});
