import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, RequestMethod, UnprocessableEntityException } from '@nestjs/common';
import { GUARDS_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { MusicController } from './music.controller';
import { MusicService } from './music.service';
import { SupabaseAuthGuard } from '../guards/auth.guard';

// El controller saltea la validación de magic numbers de los archivos solo cuando NODE_ENV === 'test'.
// Jest ya lo define así, pero se fuerza para que el spec no dependa de cómo se lo ejecute.
process.env.NODE_ENV = 'test';

describe('MusicController', () => {
  let controller: MusicController;
  let service: {
    getMusicPosts: jest.Mock;
    getUserMusicPosts: jest.Mock;
    getMusicPost: jest.Mock;
    postSong: jest.Mock;
  };

  const buildCover = (mimetype = 'image/png') => ({
    fieldname: 'song_cover_img',
    originalname: 'portada.png',
    mimetype,
    buffer: Buffer.from('fake-cover'),
    size: 1024,
  });

  const buildSong = (mimetype = 'audio/mpeg') => ({
    fieldname: 'song_file',
    originalname: 'tema.mp3',
    mimetype,
    buffer: Buffer.from('fake-audio'),
    size: 2048,
  });

  const buildBody = () => ({
    song_name: 'Mi primera canción',
    song_description: 'Una canción hermosa y emotiva',
    tags: ['rock', 'pop'],
    rating: 'G',
  });

  // FileFieldsInterceptor entrega cada campo como un array de archivos.
  const buildFiles = (song: object | undefined = buildSong(), cover: object | undefined = buildCover()) => {
    const files: Record<string, object[]> = {};
    if (song) files.song_file = [song];
    if (cover) files.song_cover_img = [cover];
    return files as any;
  };

  beforeEach(async () => {
    // El controller hace console.log del body y los archivos: se silencia para no ensuciar la salida.
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    // Mock nuevo en cada test: no se arrastran llamadas entre tests.
    service = {
      getMusicPosts: jest.fn(),
      getUserMusicPosts: jest.fn(),
      getMusicPost: jest.fn(),
      postSong: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [MusicController],
      providers: [{ provide: MusicService, useValue: service }],
    })
      // El guard real validaría tokens de Supabase: se reemplaza por uno que siempre deja pasar.
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<MusicController>(MusicController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  describe('getMusicPosts', () => {
    it('devuelve la lista del service y le pasa from y limit', async () => {
      const response = {
        mensaje: 'Musica obtenida',
        songs: [{ song_id: '1', song_name: 'Tema 1' }, { song_id: '2', song_name: 'Tema 2' }],
      };
      service.getMusicPosts.mockResolvedValue(response);

      const result = await controller.getMusicPosts(0, 10);

      expect(service.getMusicPosts).toHaveBeenCalledTimes(1);
      expect(service.getMusicPosts).toHaveBeenCalledWith(0, 10);
      expect(result).toEqual(response);
    });

    it('propaga el error si el service falla', async () => {
      service.getMusicPosts.mockRejectedValue(new BadRequestException('Error al obtener posts de musica'));

      await expect(controller.getMusicPosts(0, 10)).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('getUserMusicPosts', () => {
    it('devuelve las canciones del usuario y le pasa user_id, from y limit', async () => {
      const response = { mensaje: 'Musica de usuario obtenida', songs: [{ song_id: '1' }] };
      service.getUserMusicPosts.mockResolvedValue(response);

      const result = await controller.getUserMusicPosts('user-1', 5, 20);

      expect(service.getUserMusicPosts).toHaveBeenCalledTimes(1);
      expect(service.getUserMusicPosts).toHaveBeenCalledWith('user-1', 5, 20);
      expect(result).toEqual(response);
    });

    it('propaga el error si el service falla', async () => {
      service.getUserMusicPosts.mockRejectedValue(
        new BadRequestException('Error al obtener posts de musica del usuario'),
      );

      await expect(controller.getUserMusicPosts('user-1', 0, 10)).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('getMusicPost', () => {
    it('devuelve la canción pedida por id', async () => {
      const response = { mensaje: 'Cancion obtenida', song: { song_id: 'abc', song_name: 'Tema' } };
      service.getMusicPost.mockResolvedValue(response);

      const result = await controller.getMusicPost('abc');

      expect(service.getMusicPost).toHaveBeenCalledWith('abc');
      expect(result).toEqual(response);
    });

    it('propaga la excepción si la canción no existe', async () => {
      service.getMusicPost.mockRejectedValue(new BadRequestException('Error al obtener post de musica'));

      await expect(controller.getMusicPost('999')).rejects.toThrow(BadRequestException);
      expect(service.getMusicPost).toHaveBeenCalledWith('999');
    });
  });

  // ---------------------------------------------------------------------------
  describe('postSong', () => {
    it('crea el post con el id del usuario autenticado, los datos del body y los dos archivos', async () => {
      const body = buildBody();
      const song = buildSong();
      const cover = buildCover();
      const response = { mensaje: 'Subida de musica exitosa', song: { song_id: '123' } };
      service.postSong.mockResolvedValue(response);

      const result = await controller.postSong({ user: { id: 'user-1' } }, body as any, buildFiles(song, cover));

      expect(service.postSong).toHaveBeenCalledTimes(1);
      expect(service.postSong).toHaveBeenCalledWith('user-1', {
        song_name: body.song_name,
        song_description: body.song_description,
        tags: body.tags,
        rating: body.rating,
        song_file: song,
        song_cover_img: cover,
      });
      expect(result).toEqual(response);
    });

    it('usa el id del usuario de la request y no uno que venga en el body', async () => {
      const body = { ...buildBody(), user_id: 'otro-usuario' };
      service.postSong.mockResolvedValue({ mensaje: 'Subida de musica exitosa', song: {} });

      await controller.postSong({ user: { id: 'user-real' } }, body as any, buildFiles());

      expect(service.postSong.mock.calls[0][0]).toBe('user-real');
    });

    it('solo pasa al service los campos esperados (ignora el resto del body)', async () => {
      const body = { ...buildBody(), user_id: 'x', stats_id: 'y', song_url: 'http://malicioso' };
      const song = buildSong();
      const cover = buildCover();
      service.postSong.mockResolvedValue({ mensaje: 'Subida de musica exitosa', song: {} });

      await controller.postSong({ user: { id: 'user-1' } }, body as any, buildFiles(song, cover));

      expect(service.postSong).toHaveBeenCalledWith('user-1', {
        song_name: body.song_name,
        song_description: body.song_description,
        tags: body.tags,
        rating: body.rating,
        song_file: song,
        song_cover_img: cover,
      });
    });

it('lanza BadRequestException y no llama al service si falta el archivo de música', async () => {
      const req = { user: { id: 'user-1' } };
      
      // Pásalo explícitamente sin usar la función buildFiles para evitar comportamientos ocultos
      const promise = controller.postSong(
        req, 
        buildBody() as any, 
        { song_file: undefined, song_cover_img: [buildCover() as any] } as any
      );

    await expect(promise).rejects.toBeInstanceOf(BadRequestException);
    await expect(promise).rejects.toThrow('El archivo de música y la imagen de portada son obligatorios');
    expect(service.postSong).not.toHaveBeenCalled();
    });
    it('rechaza una portada que no es imagen y no llama al service', async () => {
      const files = buildFiles(buildSong(), buildCover('text/plain'));

      await expect(controller.postSong({ user: { id: 'user-1' } }, buildBody() as any, files)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(service.postSong).not.toHaveBeenCalled();
    });

    it('rechaza un archivo de música que no es audio y no llama al service', async () => {
      const files = buildFiles(buildSong('video/mp4'), buildCover());

      await expect(controller.postSong({ user: { id: 'user-1' } }, buildBody() as any, files)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(service.postSong).not.toHaveBeenCalled();
    });

    ['image/jpeg', 'image/png', 'image/gif'].forEach((mimetype) => {
      it(`acepta una portada ${mimetype}`, async () => {
        service.postSong.mockResolvedValue({ mensaje: 'Subida de musica exitosa', song: {} });

        await controller.postSong({ user: { id: 'user-1' } }, buildBody() as any, buildFiles(buildSong(), buildCover(mimetype)));

        expect(service.postSong).toHaveBeenCalledTimes(1);
      });
    });

    ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/flac'].forEach((mimetype) => {
      it(`acepta una canción ${mimetype}`, async () => {
        service.postSong.mockResolvedValue({ mensaje: 'Subida de musica exitosa', song: {} });

        await controller.postSong({ user: { id: 'user-1' } }, buildBody() as any, buildFiles(buildSong(mimetype), buildCover()));

        expect(service.postSong).toHaveBeenCalledTimes(1);
      });
    });

    it('propaga el error si el service falla al subir el post', async () => {
      service.postSong.mockRejectedValue(new BadRequestException('Error al subir info del post de Musica'));

      await expect(
        controller.postSong({ user: { id: 'user-1' } }, buildBody() as any, buildFiles()),
      ).rejects.toThrow('Error al subir info del post de Musica');
    });
  });

  // ---------------------------------------------------------------------------
  describe('rutas y guards', () => {
    it('cuelga del prefijo /Music', () => {
      expect(Reflect.getMetadata(PATH_METADATA, MusicController)).toBe('Music');
    });

    const routes: Array<[string, Function, string, RequestMethod]> = [
      ['getMusicPosts', MusicController.prototype.getMusicPosts, 'MusicPosts', RequestMethod.GET],
      ['getUserMusicPosts', MusicController.prototype.getUserMusicPosts, 'UserMusicPosts/:id', RequestMethod.GET],
      ['getMusicPost', MusicController.prototype.getMusicPost, 'MusicPost/:id', RequestMethod.GET],
      ['postSong', MusicController.prototype.postSong, 'PostMusic', RequestMethod.POST],
    ];

    routes.forEach(([name, handler, path, method]) => {
      it(`${name} responde en ${RequestMethod[method]} /Music/${path}`, () => {
        expect(Reflect.getMetadata(PATH_METADATA, handler)).toBe(path);
        expect(Reflect.getMetadata(METHOD_METADATA, handler)).toBe(method);
      });
    });

    it('postSong exige autenticación con SupabaseAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, MusicController.prototype.postSong);

      expect(guards).toContain(SupabaseAuthGuard);
    });
  });
});
