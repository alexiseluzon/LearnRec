import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const LIKED_THRESHOLD = 4; // ratings >= this count as "liked"
const MAX_RECOMMENDATIONS = 10;

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Rule-based recommender:
   * 1. Find tags from resources the user rated >= LIKED_THRESHOLD
   * 2. Score other resources by how many of those tags they share
   * 3. Exclude resources the user already rated
   * 4. Return top matches, highest overlap first
   */
  async getForUser(userId: string) {
    const likedRatings = await this.prisma.rating.findMany({
      where: { userId, score: { gte: LIKED_THRESHOLD } },
      include: { resource: { select: { tags: true } } },
    });

    const ratedResourceIds = await this.prisma.rating.findMany({
      where: { userId },
      select: { resourceId: true },
    });
    const excludeIds = ratedResourceIds.map((r) => r.resourceId);

    // No liked resources yet -> fall back to most popular unrated resources
    if (likedRatings.length === 0) {
      return this.getFallbackPopular(excludeIds);
    }

    const likedTags = new Set(likedRatings.flatMap((r) => r.resource.tags));

    const candidates = await this.prisma.resource.findMany({
      where: {
        id: { notIn: excludeIds },
        tags: { hasSome: Array.from(likedTags) },
      },
    });

    const scored = candidates
      .map((resource) => ({
        resource,
        overlap: resource.tags.filter((t) => likedTags.has(t)).length,
      }))
      .sort((a, b) => b.overlap - a.overlap)
      .slice(0, MAX_RECOMMENDATIONS)
      .map((s) => s.resource);

    return scored;
  }

  private async getFallbackPopular(excludeIds: string[]) {
    const resources = await this.prisma.resource.findMany({
      where: { id: { notIn: excludeIds } },
      include: { _count: { select: { ratings: true } } },
      orderBy: { ratings: { _count: 'desc' } },
      take: MAX_RECOMMENDATIONS,
    });
    return resources;
  }
}
