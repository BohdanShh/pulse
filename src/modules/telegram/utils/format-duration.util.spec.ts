import { describe, expect, it } from 'vitest';

import { formatDuration } from './format-duration.util.js';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('formatDuration', () => {
  it.each([
    [0, '0s'],
    [45 * SECOND, '45s'],
    [59 * SECOND + 999, '59s'],
    [MINUTE, '1m'],
    [12 * MINUTE + 30 * SECOND, '12m'],
    [HOUR, '1h'],
    [3 * HOUR + 5 * MINUTE, '3h 5m'],
    [DAY, '1d'],
    [2 * DAY + 4 * HOUR + 59 * MINUTE, '2d 4h'],
  ])('formats %i ms as "%s"', (ms, expected) => {
    expect(formatDuration(ms)).toBe(expected);
  });

  it('shows a negative duration as 0s', () => {
    expect(formatDuration(-5 * SECOND)).toBe('0s');
  });
});
