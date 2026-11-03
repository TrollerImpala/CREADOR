import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { JobOfferController } from './job-offer.controller';
import { JobOfferService } from './job-offer.service';
import { SupabaseAuthGuard } from '../guards/auth.guard';

describe('JobOfferController', () => {
  let controller: JobOfferController;
  let service: JobOfferService;

  const mockJobOfferService = {
    getJobOfferPosts: jest.fn(() => Promise.resolve([{ id: '1', project_title: 'Oferta 1' }])),
    getUserJobOfferPosts: jest.fn(() => Promise.resolve([{ id: '2', project_title: 'Oferta de Usuario' }])),
    getJobOfferPost: jest.fn((id: string) => Promise.resolve({ id, project_title: 'Oferta Única' })),
    postJobOffer: jest.fn((userId, dto) => Promise.resolve({ success: true, id: '3', ...dto, user_id: userId })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobOfferController],
      providers: [
        {
          provide: JobOfferService,
          useValue: mockJobOfferService,
        },
      ],
    })
      // Sobrescribimos el guardia para que deje pasar las peticiones en los tests sin buscar SupabaseService
      .overrideGuard(SupabaseAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<JobOfferController>(JobOfferController);
    service = module.get<JobOfferService>(JobOfferService);
    
    jest.clearAllMocks();
  });

  it('debe estar definido el controlador', () => {
    expect(controller).toBeDefined();
  });

  describe('getJobOfferPosts', () => {
    it('debe devolver todas las publicaciones de ofertas de trabajo', async () => {
      const result = await controller.getJobOfferPosts(0, 10);
      expect(result).toEqual([{ id: '1', project_title: 'Oferta 1' }]);
      expect(service.getJobOfferPosts).toHaveBeenCalledWith(0, 10);
    });
  });

  describe('getUserMusicPosts (getUserJobOfferPosts)', () => {
    it('debe devolver las publicaciones de ofertas de un usuario específico', async () => {
      const result = await controller.getUserMusicPosts('user-123', 0, 10);
      expect(result).toEqual([{ id: '2', project_title: 'Oferta de Usuario' }]);
      expect(service.getUserJobOfferPosts).toHaveBeenCalledWith('user-123', 0, 10);
    });
  });

  describe('getJobOfferPost', () => {
    it('debe devolver una publicación de oferta de trabajo específica por su ID', async () => {
      const result = await controller.getJobOfferPost('job-xyz');
      expect(result).toEqual({ id: 'job-xyz', project_title: 'Oferta Única' });
      expect(service.getJobOfferPost).toHaveBeenCalledWith('job-xyz');
    });
  });

  describe('postJobOffer', () => {
    it('debe crear una nueva publicación de oferta de trabajo correctamente', async () => {
      const req = { user: { id: 'user-abc' } };
      const dto = {
        project_title: 'Busco programador',
        project_info: 'Proyecto copado',
        email: 'test@gmail.com',
        tags: ['programacion'],
      };

      const result = await controller.postJobOffer(req, dto as any);

      expect(result).toEqual({
        success: true,
        id: '3',
        user_id: 'user-abc',
        ...dto,
      });
      expect(service.postJobOffer).toHaveBeenCalledWith('user-abc', dto);
    });
  });
});