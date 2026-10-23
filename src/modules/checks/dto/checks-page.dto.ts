import { Check } from '../entities/check.entity.js';

export class ChecksPageDto {
  /** Checks from newest to oldest. */
  items: Check[];

  /** Pass as `before` to get the next page. Null when there are no more checks. */
  nextCursor: string | null;
}
