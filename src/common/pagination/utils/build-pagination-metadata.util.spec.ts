import { describe, expect, it } from 'vitest';

import { buildPaginationMetadata } from './build-pagination-metadata.util.js';
import { getLimitOffset } from './get-limit-offset.util.js';

describe('getLimitOffset', () => {
  it('turns a page number into an offset', () => {
    expect(getLimitOffset({ page: 3, limit: 20 })).toEqual({ limit: 20, offset: 40 });
  });

  it('starts at the first page with the default limit', () => {
    expect(getLimitOffset({})).toEqual({ limit: 20, offset: 0 });
  });
});

describe('buildPaginationMetadata', () => {
  it('has no prev on the first page', () => {
    expect(buildPaginationMetadata({ page: 1, limit: 10 }, 25)).toEqual({
      all: 25,
      next: 2,
      prev: null,
    });
  });

  it('has both neighbours on a middle page', () => {
    expect(buildPaginationMetadata({ page: 2, limit: 10 }, 25)).toMatchObject({ next: 3, prev: 1 });
  });

  it('has no next on the last page', () => {
    expect(buildPaginationMetadata({ page: 3, limit: 10 }, 25)).toMatchObject({
      next: null,
      prev: 2,
    });
  });

  it('points prev to the last page when the page is past the end', () => {
    expect(buildPaginationMetadata({ page: 10, limit: 10 }, 25)).toMatchObject({
      next: null,
      prev: 3,
    });
  });

  it('has no neighbours when there are no items', () => {
    expect(buildPaginationMetadata({ page: 1, limit: 10 }, 0)).toEqual({
      all: 0,
      next: null,
      prev: null,
    });
  });
});
