import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from './recommendations.service';
import { PrismaService } from '../prisma/prisma.service';

describe('RecommendationsService', () => {
  let service: RecommendationsService;
  let prisma: {
    rating: { findMany: jest.Mock };
    resource: { findMany: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      rating: { findMany: jest.fn() },
      resource: { findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [RecommendationsService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(RecommendationsService);
    jest.clearAllMocks();
  });

  describe('getForUser', () => {
    it('falls back to popular resources when user has no liked ratings', async () => {
      prisma.rating.findMany
        .mockResolvedValueOnce([]) // liked ratings (score >= 4)
        .mockResolvedValueOnce([]); // all ratings (for exclusion list)
      prisma.resource.findMany.mockResolvedValue([
        { id: 'r1', title: 'Popular', _count: { ratings: 10 } },
      ]);

      const result = await service.getForUser('user1');

      expect(result).toEqual([{ id: 'r1', title: 'Popular', _count: { ratings: 10 } }]);
      expect(prisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { ratings: { _count: 'desc' } },
        }),
      );
    });

    it('recommends resources by tag overlap with liked resources, sorted by overlap descending', async () => {
      prisma.rating.findMany
        .mockResolvedValueOnce([
          { resource: { tags: ['javascript', 'backend'] } },
          { resource: { tags: ['nodejs'] } },
        ]) // liked ratings
        .mockResolvedValueOnce([{ resourceId: 'already-rated' }]); // exclusion list

      prisma.resource.findMany.mockResolvedValue([
        { id: 'r1', tags: ['javascript'] }, // overlap: 1
        { id: 'r2', tags: ['javascript', 'backend', 'nodejs'] }, // overlap: 3
        { id: 'r3', tags: ['backend'] }, // overlap: 1
      ]);

      const result = await service.getForUser('user1');

      expect(result[0].id).toBe('r2'); // highest overlap first
      expect(prisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { notIn: ['already-rated'] },
          }),
        }),
      );
    });

    it('excludes resources the user already rated from candidates', async () => {
      prisma.rating.findMany
        .mockResolvedValueOnce([{ resource: { tags: ['js'] } }])
        .mockResolvedValueOnce([{ resourceId: 'r1' }, { resourceId: 'r2' }]);
      prisma.resource.findMany.mockResolvedValue([]);

      await service.getForUser('user1');

      expect(prisma.resource.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: { notIn: ['r1', 'r2'] },
          }),
        }),
      );
    });

    it('caps recommendations at 10 results', async () => {
      prisma.rating.findMany
        .mockResolvedValueOnce([{ resource: { tags: ['js'] } }])
        .mockResolvedValueOnce([]);

      const manyCandidates = Array.from({ length: 15 }, (_, i) => ({
        id: `r${i}`,
        tags: ['js'],
      }));
      prisma.resource.findMany.mockResolvedValue(manyCandidates);

      const result = await service.getForUser('user1');

      expect(result.length).toBe(10);
    });
  });
});