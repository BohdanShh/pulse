import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../constants/pagination.constant.js';

export class PaginationQueryDto {
  /**
   * Page number, starting from 1.
   * @example 1
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = DEFAULT_PAGE;

  /**
   * Items per page.
   * @example 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number = DEFAULT_LIMIT;
}
