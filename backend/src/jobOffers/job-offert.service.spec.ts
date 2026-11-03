import 'reflect-metadata';
import { Test, TestingModule } from '@nestjs/testing';
import { JobOfferService } from './job-offer.service';
import { SupabaseService } from '../sub_services/supabaseClient';
import { StorageService } from '../sub_services/storage.service';
import { StatsCreatorService } from '../sub_services/stats_creator';
import { BadRequestException } from '@nestjs/common';

describe('JobOfferService', () => {
  let service: JobOfferService;
  let supabaseClientMock: any;

  beforeEach(async () => {
    // Creamos los mocks para encadenar las consultas de Supabase fluent API
    supabaseClientMock = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
    };

    const mockSupabaseService = {
      getClient: jest.fn(() => supabaseClientMock),
    };

    const mockStorageService = {};
    const mockStatsCreatorService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobOfferService,
        { provide: SupabaseService, useValue: mockSupabaseService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: StatsCreatorService, useValue: mockStatsCreatorService },
      ],
    }).compile();

    service = module.get<JobOfferService>(JobOfferService);
    jest.clearAllMocks();
  });

  it('debe estar definido el servicio', () => {
    expect(service).toBeDefined();
  });

  describe('getJobOfferPosts', () => {
    it('debe retornar las ofertas de trabajo correctamente', async () => {
      const mockData = [{ project_id: '1', project_title: 'Test' }];
      supabaseClientMock.range.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await service.getJobOfferPosts(0, 10);

      expect(result).toEqual({
        mensaje: 'Ofertas de trabajo obtenidas',
        job_offers: mockData,
      });
      expect(supabaseClientMock.from).toHaveBeenCalledWith('PROJECTPOSTS');
    });

    it('debe lanzar BadRequestException si ocurre un error en Supabase', async () => {
      supabaseClientMock.range.mockResolvedValueOnce({ data: null, error: { message: 'Error DB' } });

      await expect(service.getJobOfferPosts(0, 10)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getUserJobOfferPosts', () => {
    it('debe retornar las ofertas de trabajo de un usuario específico', async () => {
      const mockData = [{ project_id: '2', project_title: 'User Job' }];
      supabaseClientMock.range.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await service.getUserJobOfferPosts('user-1', 0, 10);

      expect(result).toEqual({
        mensaje: 'Ofertas de trabajo obtenidas',
        job_offers: mockData,
      });
      expect(supabaseClientMock.eq).toHaveBeenCalledWith('user_id', 'user-1');
    });

    it('debe lanzar BadRequestException si Supabase falla al buscar por usuario', async () => {
      supabaseClientMock.range.mockResolvedValueOnce({ data: null, error: { message: 'Error user' } });

      await expect(service.getUserJobOfferPosts('user-1', 0, 10)).rejects.toThrow(BadRequestException);
    });
  });

  describe('getJobOfferPost', () => {
    it('debe retornar una oferta de trabajo específica', async () => {
      const mockData = { project_id: '1', project_title: 'Unique' };
      supabaseClientMock.single.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await service.getJobOfferPost('1');

      expect(result).toEqual({
        mensaje: 'Oferta de trabajo obtenida',
        job_offer: mockData,
      });
      expect(supabaseClientMock.eq).toHaveBeenCalledWith('project_id', '1');
    });

    it('debe lanzar BadRequestException si no encuentra la oferta', async () => {
      supabaseClientMock.single.mockResolvedValueOnce({ data: null, error: { message: 'Not found' } });

      await expect(service.getJobOfferPost('999')).rejects.toThrow(BadRequestException);
    });
  });

  describe('postJobOffer', () => {
    it('debe crear y retornar la oferta de trabajo exitosamente', async () => {
      const body = {
        project_title: 'Nuevo proyecto',
        project_info: 'Info...',
        email: 'test@test.com',
        tags: ['dev'],
      };
      const mockCreated = { project_id: '10', ...body, user_id: 'user-1' };
      supabaseClientMock.single.mockResolvedValueOnce({ data: mockCreated, error: null });

      const result = await service.postJobOffer('user-1', body);

      expect(result).toEqual({
        mensaje: 'Subida de oferta exitosa',
        job_offer: mockCreated,
      });
      expect(supabaseClientMock.insert).toHaveBeenCalledWith({
        ...body,
        user_id: 'user-1',
      });
    });

    it('debe lanzar BadRequestException si falla la inserción en Supabase', async () => {
      supabaseClientMock.single.mockResolvedValueOnce({ data: null, error: { message: 'Insert error' } });

      await expect(service.postJobOffer('user-1', {} as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deletePost', () => {
    it('debe eliminar la oferta de trabajo correctamente', async () => {
      const mockDeleted = { project_id: '5', project_title: 'Borrada' };
      supabaseClientMock.single.mockResolvedValueOnce({ data: mockDeleted, error: null });

      const result = await service.deletePost('5');

      expect(result).toEqual({
        mensaje: 'Oferta de trabajo eliminada con éxito',
        deletedData: mockDeleted,
      });
      expect(supabaseClientMock.delete).toHaveBeenCalled();
      expect(supabaseClientMock.eq).toHaveBeenCalledWith('project_id', '5');
    });

    it('debe lanzar BadRequestException si falla la eliminación', async () => {
      supabaseClientMock.single.mockResolvedValueOnce({ data: null, error: { message: 'Delete error' } });

      await expect(service.deletePost('5')).rejects.toThrow(BadRequestException);
    });
  });
});