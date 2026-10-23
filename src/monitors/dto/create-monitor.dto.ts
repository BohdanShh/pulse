import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { httpMethod } from '../../database/schema.js';
import { type HttpMethod } from '../entities/monitor.entity.js';

export class CreateMonitorDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  url: string;

  @IsOptional()
  @IsIn(httpMethod.enumValues)
  method?: HttpMethod;

  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(3600)
  intervalSeconds?: number;
}
