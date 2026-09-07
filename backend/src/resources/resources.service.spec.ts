import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ResourcesService', () => {
  let service: ResourcesService;
  let prisma: {
    resource: { create: jest.Mock; findMany: jest.Mock; findUnique: jest.Mock };
    rating: { upsert: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      resource: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
      rating: { upsert: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ResourcesService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(ResourcesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a resource tied to the creating user', async () => {
      prisma.resource.create.mockResolvedValue({ id: 'r1', title: 'Test' });

      await service.create('user1', {
        title: 'Test',
        url: 'https://example.com',
        type: 'ARTICLE' as any,
        tags: ['js'],
      });

      expect(prisma.resource.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ createdById: 'user1' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('throws NotFoundException if resource does not exist', async () => {
      prisma.resource.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing-id')).rejects.toThrow(NotFoundException);
    });

    it('returns the resource if found', async () => {
      prisma.resource.findUnique.mockResolvedValue({ id: 'r1', title: 'Test' });

      const result = await service.findOne('r1');

      expect(result.id).toBe('r1');
    });
  });

  describe('rate', () => {
    it('404s if resource does not exist before rating', async () => {
      prisma.resource.findUnique.mockResolvedValue(null);

      await expect(
        service.rate('user1', 'missing-id', { score: 5 }),
      ).rejects.toThrow(NotFoundException);
      expect(prisma.rating.upsert).not.toHaveBeenCalled();
    });

    it('upserts a rating for an existing resource', async () => {
      prisma.resource.findUnique.mockResolvedValue({ id: 'r1' });
      prisma.rating.upsert.mockResolvedValue({ userId: 'user1', resourceId: 'r1', score: 5 });

      const result = await service.rate('user1', 'r1', { score: 5 });

      expect(prisma.rating.upsert).toHaveBeenCalledWith({
        where: { userId_resourceId: { userId: 'user1', resourceId: 'r1' } },
        create: { userId: 'user1', resourceId: 'r1', score: 5 },
        update: { score: 5 },
      });
      expect(result.score).toBe(5);
    });
  });
});