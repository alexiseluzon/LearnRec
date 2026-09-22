import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { RateResourceDto } from './dto/rate-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(private prisma: PrismaService) {}

  create(userId: string, dto: CreateResourceDto) {
    return this.prisma.resource.create({
      data: { ...dto, createdById: userId },
    });
  }

  findAll() {
    return this.prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { ratings: true } } },
    });
  }

  async findOne(id: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id },
      include: { ratings: true },
    });
    if (!resource) throw new NotFoundException('Resource not found');
    return resource;
  }

  async rate(userId: string, resourceId: string, dto: RateResourceDto) {
    await this.findOne(resourceId); // 404s if missing

    // upsert: create a rating, or update the score if user already rated this resource
    return this.prisma.rating.upsert({
      where: { userId_resourceId: { userId, resourceId } },
      create: { userId, resourceId, score: dto.score },
      update: { score: dto.score },
    });
  }
}
