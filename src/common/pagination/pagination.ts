import { PaginationMetadataDto } from './pagination-metadata.dto.js';
import { DEFAULT_LIMIT, DEFAULT_PAGE, PaginationQueryDto } from './pagination-query.dto.js';

export function getOffset({
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
}: PaginationQueryDto): number {
  return (page - 1) * limit;
}

export function buildPaginationMetadata(
  { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT }: PaginationQueryDto,
  all: number,
): PaginationMetadataDto {
  const pages = Math.ceil(all / limit);

  return {
    all,
    next: page < pages ? page + 1 : null,
    prev: page > 1 ? Math.min(page - 1, Math.max(pages, 1)) : null,
  };
}
