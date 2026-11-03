import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { GameController } from './game.controller';
import { GameService } from './game.service';

describe('GameController', () => {
  let controller: GameController;
  let service: { getGamePosts: jest.Mock; getGamePost: jest.Mock };

  beforeEach(async () => {
    // Mock nuevo en cada test: no se arrastran llamadas entre tests.
    service = {
      getGamePosts: jest.fn(),
      getGamePost: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GameController],
      providers: [{ provide: GameService, useValue: service }],
    }).compile();

    controller = module.get<GameController>(GameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  describe('getGamePosts', () => {
    it('devuelve la lista de juegos que entrega el service', async () => {
      const response = {
        mensaje: 'Juegos obtenidos',
        games: [
          { game_id: '1', game_title: 'Tetris', game_cover_url: 'url1', game_rating: 'G', mobile_friendly: true },
          { game_id: '2', game_title: 'Doom', game_cover_url: 'url2', game_rating: 'R', mobile_friendly: false },
        ],
      };
      service.getGamePosts.mockResolvedValue(response);

      const result = await controller.getGamePosts();

      expect(service.getGamePosts).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });

    it('propaga el error si el service falla', async () => {
      service.getGamePosts.mockRejectedValue(new BadRequestException('Error al obtener posts de juegos'));

      await expect(controller.getGamePosts()).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('getGamePost', () => {
    it('devuelve el juego pedido por id', async () => {
      const response = {
        mensaje: 'Juego obtenido',
        game: { game_id: 'abc', game_title: 'Tetris', game_rating: 'G' },
      };
      service.getGamePost.mockResolvedValue(response);

      const result = await controller.getGamePost('abc');

      expect(service.getGamePost).toHaveBeenCalledTimes(1);
      expect(service.getGamePost).toHaveBeenCalledWith('abc');
      expect(result).toEqual(response);
    });

    it('propaga la excepción si el juego no existe', async () => {
      service.getGamePost.mockRejectedValue(new BadRequestException('Error al obtener post de juegos'));

      await expect(controller.getGamePost('999')).rejects.toThrow(BadRequestException);
      expect(service.getGamePost).toHaveBeenCalledWith('999');
    });
  });

  // ---------------------------------------------------------------------------
  describe('rutas', () => {
    it('cuelga del prefijo /Game', () => {
      expect(Reflect.getMetadata(PATH_METADATA, GameController)).toBe('Game');
    });

    const routes: Array<[string, Function, string]> = [
      ['getGamePosts', GameController.prototype.getGamePosts, 'GamePosts'],
      ['getGamePost', GameController.prototype.getGamePost, 'GamePost/:id'],
    ];

    routes.forEach(([name, handler, path]) => {
      it(`${name} responde en GET /Game/${path}`, () => {
        expect(Reflect.getMetadata(PATH_METADATA, handler)).toBe(path);
        expect(Reflect.getMetadata(METHOD_METADATA, handler)).toBe(RequestMethod.GET);
      });
    });
  });
});
