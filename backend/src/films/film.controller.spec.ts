import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { FilmController } from './film.controller';
import { FilmService } from './film.service';

describe('FilmController', () => {
  let controller: FilmController;
  let service: { getFilmPosts: jest.Mock; getFilmPost: jest.Mock };

  beforeEach(async () => {
    // Mock nuevo en cada test: no se arrastran llamadas entre tests.
    service = {
      getFilmPosts: jest.fn(),
      getFilmPost: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilmController],
      providers: [{ provide: FilmService, useValue: service }],
    }).compile();

    controller = module.get<FilmController>(FilmController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  describe('getFilmPosts', () => {
    it('devuelve la lista de filmes que entrega el service', async () => {
      const response = {
        mensaje: 'Filmes obtenidos',
        films: [
          { film_id: '1', film_title: 'Metropolis', film_thumbnail_url: 'url1', rating: 'G' },
          { film_id: '2', film_title: 'Blade Runner', film_thumbnail_url: 'url2', rating: 'R' },
        ],
      };
      service.getFilmPosts.mockResolvedValue(response);

      const result = await controller.getFilmPosts();

      expect(service.getFilmPosts).toHaveBeenCalledTimes(1);
      expect(result).toEqual(response);
    });

    it('propaga el error si el service falla', async () => {
      service.getFilmPosts.mockRejectedValue(new BadRequestException('Error al obtener posts de filmes'));

      await expect(controller.getFilmPosts()).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('getFilmPost', () => {
    it('devuelve el filme pedido por id', async () => {
      const response = {
        mensaje: 'Filme obtenido',
        film: { film_id: 'abc', film_title: 'Metropolis', rating: 'G' },
      };
      service.getFilmPost.mockResolvedValue(response);

      const result = await controller.getFilmPost('abc');

      expect(service.getFilmPost).toHaveBeenCalledTimes(1);
      expect(service.getFilmPost).toHaveBeenCalledWith('abc');
      expect(result).toEqual(response);
    });

    it('propaga la excepción si el filme no existe', async () => {
      service.getFilmPost.mockRejectedValue(new BadRequestException('Error al obtener post de filmes'));

      await expect(controller.getFilmPost('999')).rejects.toThrow(BadRequestException);
      expect(service.getFilmPost).toHaveBeenCalledWith('999');
    });
  });

  // ---------------------------------------------------------------------------
  describe('rutas', () => {
    it('cuelga del prefijo /Film', () => {
      expect(Reflect.getMetadata(PATH_METADATA, FilmController)).toBe('Film');
    });

    const routes: Array<[string, Function, string]> = [
      ['getFilmPosts', FilmController.prototype.getFilmPosts, 'FilmPosts'],
      ['getFilmPost', FilmController.prototype.getFilmPost, 'FilmPost/:id'],
    ];

    routes.forEach(([name, handler, path]) => {
      it(`${name} responde en GET /Film/${path}`, () => {
        expect(Reflect.getMetadata(PATH_METADATA, handler)).toBe(path);
        expect(Reflect.getMetadata(METHOD_METADATA, handler)).toBe(RequestMethod.GET);
      });
    });
  });
});
