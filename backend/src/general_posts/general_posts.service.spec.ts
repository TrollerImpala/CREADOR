import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GeneralPostsService } from './general_posts.service';

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

describe('GeneralPostsService', () => {
  let service: GeneralPostsService;
  let supabase: { from: jest.Mock };
  let supabaseService: { getClient: jest.Mock };
  let artService: { deletePost: jest.Mock };
  let musicService: { deletePost: jest.Mock };
  let jobOfferService: { deletePost: jest.Mock };

  // Hace que la próxima búsqueda del post devuelva { data, error } y expone el builder para inspeccionarlo.
  const postLookupReturns = (result: QueryResult) => {
    const builder = createQueryBuilder(result);
    supabase.from.mockReturnValue(builder);
    return builder;
  };

  const owner = { id: 'user-1' };
  const postOwnedBy = (user_id: string | null) => ({ data: { user_id }, error: null });

  beforeEach(() => {
    // El service hace varios console.log de la validación y console.error si no encuentra el post.
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    supabase = { from: jest.fn() };
    supabaseService = { getClient: jest.fn().mockReturnValue(supabase) };
    artService = { deletePost: jest.fn() };
    musicService = { deletePost: jest.fn() };
    jobOfferService = { deletePost: jest.fn() };

    service = new GeneralPostsService(
      artService as any,
      musicService as any,
      jobOfferService as any,
      supabaseService as any,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const expectNothingDeleted = () => {
    expect(artService.deletePost).not.toHaveBeenCalled();
    expect(musicService.deletePost).not.toHaveBeenCalled();
    expect(jobOfferService.deletePost).not.toHaveBeenCalled();
  };

  // ---------------------------------------------------------------------------
  describe('constructor', () => {
    it('obtiene el cliente de Supabase del SupabaseService', () => {
      expect(supabaseService.getClient).toHaveBeenCalledTimes(1);
    });
  });

  // ---------------------------------------------------------------------------
  describe('DeletPost - borrado según el tipo de post', () => {
    const cases = [
      { tipo: 'arte', table: 'ARTPOSTS', column: 'artpost_id', key: 'art' },
      { tipo: 'musica', table: 'MUSICPOSTS', column: 'song_id', key: 'music' },
      { tipo: 'JobOfferta', table: 'PROJECTPOSTS', column: 'project_id', key: 'job' },
    ] as const;

    cases.forEach(({ tipo, table, column, key }) => {
      it(`tipo "${tipo}": busca el post en ${table} por ${column} y lo elimina si es del usuario`, async () => {
        const deleters = { art: artService, music: musicService, job: jobOfferService };
        const deleteResult = { mensaje: 'Post eliminado con exito', deletedData: { id: 'post-1' } };
        deleters[key].deletePost.mockResolvedValue(deleteResult);
        const builder = postLookupReturns(postOwnedBy('user-1'));

        const result = await service.DeletPost('post-1', tipo, owner);

        expect(supabase.from).toHaveBeenCalledWith(table);
        expect(builder.select).toHaveBeenCalledWith('user_id');
        expect(builder.eq).toHaveBeenCalledWith(column, 'post-1');
        expect(builder.single).toHaveBeenCalled();
        // Solo se llama al service del tipo correspondiente
        (Object.keys(deleters) as Array<keyof typeof deleters>).forEach((k) => {
          if (k === key) {
            expect(deleters[k].deletePost).toHaveBeenCalledTimes(1);
            expect(deleters[k].deletePost).toHaveBeenCalledWith('post-1');
          } else {
            expect(deleters[k].deletePost).not.toHaveBeenCalled();
          }
        });
        expect(result).toEqual(deleteResult);
      });
    });

    it('lanza ForbiddenException y no consulta ni borra nada si el tipo es inválido', async () => {
      const promise = service.DeletPost('post-1', 'otro-tipo', owner);

      await expect(promise).rejects.toBeInstanceOf(ForbiddenException);
      await expect(promise).rejects.toThrow('Tipo de post inválido');
      expect(supabase.from).not.toHaveBeenCalled();
      expectNothingDeleted();
    });

    it('propaga el error si el service de borrado falla', async () => {
      artService.deletePost.mockRejectedValue(new BadRequestException('Error al eliminar el Arte'));
      postLookupReturns(postOwnedBy('user-1'));

      await expect(service.DeletPost('post-1', 'arte', owner)).rejects.toThrow('Error al eliminar el Arte');
    });
  });

  // ---------------------------------------------------------------------------
  describe('DeletPost - el post tiene que existir', () => {
    it('lanza ForbiddenException si Supabase devuelve error al buscar el post', async () => {
      postLookupReturns({ data: null, error: { message: 'no rows' } });

      const promise = service.DeletPost('post-1', 'arte', owner);

      await expect(promise).rejects.toBeInstanceOf(ForbiddenException);
      await expect(promise).rejects.toThrow('El post no existe o no se pudo encontrar');
      expectNothingDeleted();
    });

    it('lanza ForbiddenException si la búsqueda no devuelve ningún post', async () => {
      postLookupReturns({ data: null, error: null });

      await expect(service.DeletPost('post-1', 'musica', owner)).rejects.toThrow(
        'El post no existe o no se pudo encontrar',
      );
      expectNothingDeleted();
    });
  });

  // ---------------------------------------------------------------------------
  describe('DeletPost - permisos', () => {
    it('lanza ForbiddenException y no borra si el usuario no es el dueño del post', async () => {
      postLookupReturns(postOwnedBy('otro-usuario'));

      const promise = service.DeletPost('post-1', 'arte', owner);

      await expect(promise).rejects.toBeInstanceOf(ForbiddenException);
      await expect(promise).rejects.toThrow('No tienes permisos para eliminar este post');
      expectNothingDeleted();
    });

    it('lanza ForbiddenException si no hay usuario autenticado', async () => {
      postLookupReturns(postOwnedBy('user-1'));

      await expect(service.DeletPost('post-1', 'arte', undefined)).rejects.toThrow(
        'No tienes permisos para eliminar este post',
      );
      expectNothingDeleted();
    });

    it('lanza ForbiddenException si el usuario no trae ningún id', async () => {
      postLookupReturns(postOwnedBy('user-1'));

      await expect(service.DeletPost('post-1', 'arte', {})).rejects.toThrow(
        'No tienes permisos para eliminar este post',
      );
      expectNothingDeleted();
    });

    it('no considera dueño a nadie si el post no tiene user_id', async () => {
      postLookupReturns(postOwnedBy(null));

      await expect(service.DeletPost('post-1', 'arte', {})).rejects.toThrow(
        'No tienes permisos para eliminar este post',
      );
      expectNothingDeleted();
    });

    [
      { campo: 'id', user: { id: 'user-1' } },
      { campo: 'userId', user: { userId: 'user-1' } },
      { campo: 'sub', user: { sub: 'user-1' } },
    ].forEach(({ campo, user }) => {
      it(`reconoce al dueño cuando el id del usuario viene en "${campo}"`, async () => {
        artService.deletePost.mockResolvedValue({ mensaje: 'Post eliminado con exito' });
        postLookupReturns(postOwnedBy('user-1'));

        await service.DeletPost('post-1', 'arte', user);

        expect(artService.deletePost).toHaveBeenCalledWith('post-1');
      });
    });

    it('ignora los espacios alrededor de los ids al comparar', async () => {
      artService.deletePost.mockResolvedValue({ mensaje: 'Post eliminado con exito' });
      postLookupReturns(postOwnedBy(' user-1 '));

      await service.DeletPost('post-1', 'arte', { id: 'user-1' });

      expect(artService.deletePost).toHaveBeenCalledWith('post-1');
    });

    it('un usuario con rol "modedador" puede borrar posts de otros', async () => {
      // OJO: el service compara el rol con 'modedador' (sin la "r"), probablemente un typo de 'moderador'.
      // El test documenta el comportamiento actual: si corregís el texto en el service, actualizalo acá.
      musicService.deletePost.mockResolvedValue({ mensaje: 'Post eliminado con exito' });
      postLookupReturns(postOwnedBy('otro-usuario'));

      await service.DeletPost('post-1', 'musica', { id: 'user-1', role: '  Modedador ' });

      expect(musicService.deletePost).toHaveBeenCalledWith('post-1');
    });
  });
});
