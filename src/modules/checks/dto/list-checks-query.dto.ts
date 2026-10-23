import { Type } from 'class-transformer';
import { IsISO8601, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListChecksQueryDto {
  /**
   * How many checks to return. Defaults to 20.
   * @example 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  /**
   * Cursor: return checks older than this time. Use `nextCursor` from the previous page.
   * @example "2026-10-23T19:40:00.000Z"
   */
  @IsOptional()
  @IsISO8601()
  before?: string;
}
