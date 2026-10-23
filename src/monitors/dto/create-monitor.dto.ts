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
  /** @example "GitHub API" */
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  /**
   * URL to check. Must start with http:// or https://.
   * @example "https://api.github.com"
   */
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  url: string;

  /** HTTP method used for the check. Defaults to GET. */
  @IsOptional()
  @IsIn(httpMethod.enumValues)
  method?: HttpMethod;

  /**
   * How often the URL is checked, in seconds. Defaults to 60.
   * @example 60
   */
  @IsOptional()
  @IsInt()
  @Min(30)
  @Max(3600)
  intervalSeconds?: number;
}
