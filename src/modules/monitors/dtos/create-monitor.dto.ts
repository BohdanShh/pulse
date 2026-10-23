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

import {
  MAX_INTERVAL_SECONDS,
  MIN_INTERVAL_SECONDS,
} from '../../../database/constants/monitors.constant.js';
import { httpMethod } from '../../../database/schema/index.js';
import {
  MONITOR_NAME_MAX_LENGTH,
  MONITOR_URL_MAX_LENGTH,
  MONITOR_URL_PROTOCOLS,
} from '../constants/monitor.constant.js';
import { type HttpMethod } from '../types/http-method.type.js';

export class CreateMonitorDto {
  /** @example "GitHub API" */
  @IsString()
  @IsNotEmpty()
  @MaxLength(MONITOR_NAME_MAX_LENGTH)
  name: string;

  /**
   * URL to check. Must start with http:// or https://.
   * @example "https://api.github.com"
   */
  @IsUrl({ protocols: MONITOR_URL_PROTOCOLS, require_protocol: true })
  @MaxLength(MONITOR_URL_MAX_LENGTH)
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
  @Min(MIN_INTERVAL_SECONDS)
  @Max(MAX_INTERVAL_SECONDS)
  intervalSeconds?: number;
}
