import { BadRequestException } from '@nestjs/common';
import { GameService } from './game.service';

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

describe('GameService', () => {
  let service: GameService;
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

    // StorageService y StatsCreatorService: el service no los usa todavía.
    service = new GameService(supabaseService as any, {} as any, {} as any);
  });

  // ---------------------------------------------------------------------------
  describe('constructor', () => {
    it('obtiene el cliente de Supabase del SupabaseService', () => {
      expect(supabaseService.getClient).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  describe('getGamePosts', () => {
    it('consulta GAMEPOSTS con las columnas del listado y devuelve los juegos', async () => {
      const games = [
        { game_id: '1', game_title: 'Tetris', game_cover_url: 'url1', game_rating: 'G', mobile_friendly: true },
        { game_id: '2', game_title: 'Doom', game_cover_url: 'url2', game_rating: 'R', mobile_friendly: false },
      ];
      const builder = queryReturns({ data: games, error: null });

      const result = await service.getGamePosts();

      expect(supabase.from).toHaveBeenCalledWith('GAMEPOSTS');
      expect(builder.select).toHaveBeenCalledWith(
        'game_id, game_title, game_cover_url, game_rating, mobile_friendly',
      );
      expect(result).toEqual({ mensaje: 'Juegos obtenidos', games });
    });

    it('devuelve una lista vacía si no hay juegos', async () => {
      queryReturns({ data: [], error: null });

      const result = await service.getGamePosts();

      expect(result).toEqual({ mensaje: 'Juegos obtenidos', games: [] });
    });

    it('lanza BadRequestException con el detalle si Supabase devuelve error', async () => {
      queryReturns({ data: null, error: { message: 'boom' } });

      await expect(service.getGamePosts()).rejects.toThrow(BadRequestException);
      await expect(service.getGamePosts()).rejects.toThrow('Error al obtener posts de juegos');
      await expect(service.getGamePosts()).rejects.toThrow('boom');
    });
  });

  // ---------------------------------------------------------------------------
  describe('getGamePost', () => {
    it('busca el juego por game_id y devuelve un único resultado', async () => {
      const game = { game_id: 'abc', game_title: 'Tetris', game_rating: 'G' };
      const builder = queryReturns({ data: game, error: null });

      const result = await service.getGamePost('abc');

      expect(supabase.from).toHaveBeenCalledWith('GAMEPOSTS');
      expect(builder.eq).toHaveBeenCalledWith('game_id', 'abc');
      expect(builder.single).toHaveBeenCalled();
      expect(result).toEqual({ mensaje: 'Juego obtenido', game });
    });

    it('lanza BadRequestException si el juego no existe o la consulta falla', async () => {
      queryReturns({ data: null, error: { message: 'no rows' } });

      await expect(service.getGamePost('999')).rejects.toThrow(BadRequestException);
      await expect(service.getGamePost('999')).rejects.toThrow('Error al obtener post de juegos');
      await expect(service.getGamePost('999')).rejects.toThrow('no rows');
    });
  });
});
