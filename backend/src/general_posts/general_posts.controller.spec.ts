import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, RequestMethod } from '@nestjs/common';
import { GUARDS_METADATA, METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { generalPostscontroller } from './general_posts.controller';
import { GeneralPostsService } from './general_posts.service';
import { SupabaseAuthGuard } from '../guards/auth.guard';

describe('generalPostscontroller', () => {
  let controller: generalPostscontroller;
  let service: { DeletPost: jest.Mock };

  beforeEach(async () => {
    // Mock nuevo en cada test: no se arrastran llamadas entre tests.
    service = { DeletPost: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [generalPostscontroller],
      providers: [{ provide: GeneralPostsService, useValue: service }],
    })
      // El guard real validaría tokens de Supabase: se reemplaza por uno que siempre deja pasar.
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<generalPostscontroller>(generalPostscontroller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ---------------------------------------------------------------------------
  describe('deletpost', () => {
    it('le pasa al service el id, el tipo y el usuario de la request, y devuelve su respuesta', async () => {
      const user = { id: 'user-1', role: 'user' };
      const response = { mensaje: 'Post eliminado con exito', deletedData: { artpost_id: 'post-1' } };
      service.DeletPost.mockResolvedValue(response);

      // El controller recibe (tipo, id, req) pero el service espera (id, tipo, user)
      const result = await controller.deletpost('arte', 'post-1', { user });

      expect(service.DeletPost).toHaveBeenCalledTimes(1);
      expect(service.DeletPost).toHaveBeenCalledWith('post-1', 'arte', user);
      expect(result).toEqual(response);
    });

    ['arte', 'musica', 'JobOfferta'].forEach((tipo) => {
      it(`envía el tipo "${tipo}" tal cual al service`, async () => {
        service.DeletPost.mockResolvedValue({ mensaje: 'Post eliminado con exito' });

        await controller.deletpost(tipo, 'post-1', { user: { id: 'user-1' } });

        expect(service.DeletPost.mock.calls[0][1]).toBe(tipo);
      });
    });

    it('usa el usuario del token (req.user) y no uno que venga en otra parte de la request', async () => {
      service.DeletPost.mockResolvedValue({ mensaje: 'Post eliminado con exito' });
      const req = { user: { id: 'user-real' }, body: { user: { id: 'otro' } } };

      await controller.deletpost('arte', 'post-1', req);

      expect(service.DeletPost.mock.calls[0][2]).toEqual({ id: 'user-real' });
    });

    it('propaga la ForbiddenException si el usuario no tiene permisos', async () => {
      service.DeletPost.mockRejectedValue(new ForbiddenException('No tienes permisos para eliminar este post'));

      await expect(controller.deletpost('arte', 'post-1', { user: { id: 'otro' } })).rejects.toThrow(
        ForbiddenException,
      );
      await expect(controller.deletpost('arte', 'post-1', { user: { id: 'otro' } })).rejects.toThrow(
        'No tienes permisos para eliminar este post',
      );
    });

    it('propaga la excepción si el tipo es inválido', async () => {
      service.DeletPost.mockRejectedValue(new ForbiddenException('Tipo de post inválido'));

      await expect(controller.deletpost('otro', 'post-1', { user: { id: 'user-1' } })).rejects.toThrow(
        'Tipo de post inválido',
      );
    });
  });

  // ---------------------------------------------------------------------------
  describe('rutas y guards', () => {
    it('cuelga del prefijo /GeneralPosts', () => {
      expect(Reflect.getMetadata(PATH_METADATA, generalPostscontroller)).toBe('GeneralPosts');
    });

    it('deletpost responde en DELETE /GeneralPosts/Deleteposts/:id', () => {
      const handler = generalPostscontroller.prototype.deletpost;

      expect(Reflect.getMetadata(PATH_METADATA, handler)).toBe('Deleteposts/:id');
      expect(Reflect.getMetadata(METHOD_METADATA, handler)).toBe(RequestMethod.DELETE);
    });

    it('deletpost exige autenticación con SupabaseAuthGuard', () => {
      const guards = Reflect.getMetadata(GUARDS_METADATA, generalPostscontroller.prototype.deletpost);

      expect(guards).toContain(SupabaseAuthGuard);
    });
  });
});
