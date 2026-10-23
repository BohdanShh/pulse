import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../constants/pagination.constant.js';
import { PaginationMetadataDto } from '../dtos/pagination-metadata.dto.js';
import { PaginationQueryDto } from '../dtos/pagination-query.dto.js';

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
