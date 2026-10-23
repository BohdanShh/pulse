import { DEFAULT_LIMIT, DEFAULT_PAGE } from '../constants/pagination.constant.js';
import { PaginationQueryDto } from '../dtos/pagination-query.dto.js';
import { type LimitOffset } from '../types/limit-offset.type.js';

export function getLimitOffset({
  page = DEFAULT_PAGE,
  limit = DEFAULT_LIMIT,
}: PaginationQueryDto): LimitOffset {
  return { limit, offset: (page - 1) * limit };
}
