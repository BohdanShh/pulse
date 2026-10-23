export class PaginationMetadataDto {
  /**
   * Total number of items.
   * @example 245
   */
  all: number;

  /**
   * Next page number. Null on the last page.
   * @example 3
   */
  next: number | null;

  /**
   * Previous page number. Null on the first page.
   * @example 1
   */
  prev: number | null;
}
