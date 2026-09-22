import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { RateResourceDto } from './dto/rate-resource.dto';
import type { Request } from 'express';

@Controller('resources')
@UseGuards(JwtAuthGuard)
export class ResourcesController {
  constructor(private resourcesService: ResourcesService) {}

  @Post()
  create(@Req() req: Request, @Body() dto: CreateResourceDto) {
    return this.resourcesService.create(req.user!.userId, dto);
  }

  @Get()
  findAll() {
    return this.resourcesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @Post(':id/rate')
  rate(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: RateResourceDto,
  ) {
    return this.resourcesService.rate(req.user!.userId, id, dto);
  }
}
