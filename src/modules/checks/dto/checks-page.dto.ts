import { PaginationMetadataDto } from '../../../common/pagination/pagination-metadata.dto.js';
import { Check } from '../entities/check.entity.js';

export class ChecksPageDto {
  /** Checks from newest to oldest. */
  items: Check[];

  metadata: PaginationMetadataDto;
}
