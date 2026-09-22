import { ResourceType } from '@prisma/client';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @IsUrl()
  url!: string;

  @IsEnum(ResourceType)
  type!: ResourceType;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags!: string[];
}
