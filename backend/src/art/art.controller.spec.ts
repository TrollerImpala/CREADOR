import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, RequestMethod } from '@nestjs/common';
import { GUARDS_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { ArtController } from './art.controller';
import { ArtService } from './art.service';
import { SupabaseAuthGuard } from '../guards/auth.guard';

describe('ArtController', () => {
  let controller: ArtController;
  let service: { getArtPosts: jest.Mock; getArtPost: jest.Mock; postArt: jest.Mock };

  const buildFile = () =>
    ({
      fieldname: 'art_img',
      originalname: 'test.png',
      encoding: '7bit',
      mimetype: 'image/png',
      buffer: Buffer.from('fake-image-bytes'),
      size: 1024,
    }) as Express.Multer.File;

  const buildBody = () => ({
    title: 'Nueva Obra de Arte',
    description: 'Descripción de prueba',
    tags: ['digital', 'art'],
    rating: 'G',
  });

  beforeEach(async () => {
    // El controller hace console.log del body y el archivo: se silencia para no ensuciar la salida.
    jest.spyOn(console, 'log').mockImplementation(() => undefined);

    // Mock nuevo en cada test: no se arrastran llamadas entre tests.
    service = {
      getArtPosts: jest.fn(),
      getArtPost: jest.fn(),
      postArt: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArtController],
      providers: [{ provide: ArtService, useValue: service }],
    })
      // El guard real validaría tokens de Supabase: se reemplaza por uno que siempre deja pasar.
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<ArtController>(ArtController);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  describe('getArtPosts', () => {
    it('devuelve la lista del service y le pasa from y limit', async () => {
      const response = {
        mensaje: 'Arte obtenido',
        art: [
          { artpost_id: '1', title: 'Ilustración Gothic', art_img_url: 'url1', rating: 'G' },
          { artpost_id: '2', title: 'Cyberpunk Art', art_img_url: 'url2', rating: 'PG' },
        ],
      };
      service.getArtPosts.mockResolvedValue(response);

      const result = await controller.getArtPosts(0, 10);

      expect(service.getArtPosts).toHaveBeenCalledTimes(1);
      expect(service.getArtPosts).toHaveBeenCalledWith(0, 10);
      expect(result).toEqual(response);
      expect(result.art).toHaveLength(2);
    });

    it('propaga el error si el service falla', async () => {
      service.getArtPosts.mockRejectedValue(new BadRequestException('Error al obtener posts de arte'));

      await expect(controller.getArtPosts(0, 10)).rejects.toThrow(BadRequestException);
    });
  });

  // ---------------------------------------------------------------------------
  describe('getArtPost', () => {
    it('devuelve el post pedido por id', async () => {
      const response = {
        mensaje: 'Arte obtenido',
        art: { artpost_id: '1', title: 'Ilustración Gothic', rating: 'G' },
      };
      service.getArtPost.mockResolvedValue(response);

      const result = await controller.getArtPost('1');

      expect(service.getArtPost).toHaveBeenCalledWith('1');
      expect(result).toEqual(response);
    });

    it('propaga la excepción si el post no existe', async () => {
      service.getArtPost.mockRejectedValue(new BadRequestException('Error al obtener post de arte'));

      await expect(controller.getArtPost('999')).rejects.toThrow(BadRequestException);
      expect(service.getArtPost).toHaveBeenCalledWith('999');
    });
  });

  // ---------------------------------------------------------------------------
  describe('createArtPost', () => {
    it('crea el post con el id del usuario autenticado, los datos del body y el archivo', async () => {
      const body = buildBody();
      const file = buildFile();
      const response = {
        mensaje: 'Subida de arte exitosa',
        art: { artpost_id: '123', ...body, user_id: 'user-uuid-123' },
      };
      service.postArt.mockResolvedValue(response);

      const result = await controller.createArtPost({ user: { id: 'user-uuid-123' } }, body as any, file);

      expect(service.postArt).toHaveBeenCalledTimes(1);
      expect(service.postArt).toHaveBeenCalledWith('user-uuid-123', {
        title: body.title,
        description: body.description,
        tags: body.tags,
        rating: body.rating,
        art_img: file,
      });
      expect(result).toEqual(response);
    });

    it('usa el id del usuario de la request y no uno que venga en el body', async () => {
      const body = { ...buildBody(), user_id: 'otro-usuario' };
      service.postArt.mockResolvedValue({ mensaje: 'Subida de arte exitosa', art: {} });

      await controller.createArtPost({ user: { id: 'user-real' } }, body as any, buildFile());

      expect(service.postArt.mock.calls[0][0]).toBe('user-real');
    });

    it('solo pasa al service los campos esperados (ignora el resto del body)', async () => {
      const body = { ...buildBody(), user_id: 'x', stats_id: 'y', art_img_url: 'http://malicioso' };
      const file = buildFile();
      service.postArt.mockResolvedValue({ mensaje: 'Subida de arte exitosa', art: {} });

      await controller.createArtPost({ user: { id: 'user-1' } }, body as any, file);

      expect(service.postArt).toHaveBeenCalledWith('user-1', {
        title: body.title,
        description: body.description,
        tags: body.tags,
        rating: body.rating,
        art_img: file,
      });
    });

    it('lanza BadRequestException y no llama al service si no se adjunta imagen', async () => {
      const noFile = undefined as unknown as Express.Multer.File;

      const promise = controller.createArtPost({ user: { id: 'user-1' } }, buildBody() as any, noFile);

      await expect(promise).rejects.toBeInstanceOf(BadRequestException);
      await expect(promise).rejects.toThrow('El archivo de imagen es obligatorio');
      expect(service.postArt).not.toHaveBeenCalled();
    });

    it('propaga el error si el service falla al subir el post', async () => {
      service.postArt.mockRejectedValue(new BadRequestException('Error al subir info del post de Arte'));

      await expect(
        controller.createArtPost({ user: { id: 'user-1' } }, buildBody() as any, buildFile()),
      ).rejects.toThrow('Error al subir info del post de Arte');
    });
  });

  // ---------------------------------------------------------------------------
  // El controller no tiene endpoint de borrado: los tests de deletePost viven en art.service.spec.ts.
  describe('rutas y guards', () => {
    it('cuelga del prefijo /Art', () => {
      expect(Reflect.getMetadata(PATH_METADATA, ArtController)).toBe('Art');
    });

    const routes: Array<[keyof ArtController, string, RequestMethod]> = [
      ['getArtPosts', 'ArtPosts', RequestMethod.GET],
      ['getArtPost', 'ArtPost/:id', RequestMethod.GET],
      ['createArtPost', 'PostArt', RequestMethod.POST],
    ];

    routes.forEach(([handler, path, method]) => {
      it(`${String(handler)} responde en ${RequestMethod[method]} /Art/${path}`, () => {
        const fn = ArtController.prototype[handler];

        expect(Reflect.getMetadata(PATH_METADATA, fn)).toBe(path);
        expect(Reflect.getMetadata(METHOD_METADATA, fn)).toBe(method);
      });
    });

    it('PostArt exige autenticación con SupabaseAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, ArtController.prototype.createArtPost);

      expect(guards).toContain(SupabaseAuthGuard);
    });
  });
});
