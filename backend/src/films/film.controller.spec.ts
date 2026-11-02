import { Test, TestingModule } from '@nestjs/testing';
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
  });

  // Acá siguen tus tests: getFilmPost (con id), error del service, rutas, etc.

  describe('getFilmPost', () => {
    it('devuelve un filme específico que entrega el service', async () => {
      const filmId = '1';
      const response = {
        mensaje: 'Filme obtenido',
        film: { film_id: '1', film_title: 'Metropolis', film_thumbnail_url: 'url1', rating: 'G' },
      };
      service.getFilmPost.mockResolvedValue(response);
      
      const result = await controller.getFilmPost(filmId);

        expect(service.getFilmPost).toHaveBeenCalledWith(filmId);

        expect(result).toEqual(response);

    });
    })
});
