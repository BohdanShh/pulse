import { describe, expect, it } from 'vitest';

import { runWithConcurrency } from './run-with-concurrency.util.js';

const tick = (): Promise<void> => new Promise(resolve => setTimeout(resolve, 1));

describe('runWithConcurrency', () => {
  it('never runs more tasks at once than the limit', async () => {
    let running = 0;
    let maxRunning = 0;

    await runWithConcurrency(
      Array.from({ length: 10 }, (_, i) => i),
      3,
      async () => {
        running++;
        maxRunning = Math.max(maxRunning, running);
        await tick();
        running--;
      },
    );

    expect(maxRunning).toBe(3);
  });

  it('returns the results in the order of the items, not of completion', async () => {
    const results = await runWithConcurrency([30, 10, 20], 3, async ms => {
      await new Promise(resolve => setTimeout(resolve, ms));
      return ms;
    });

    expect(results.map(result => result.status === 'fulfilled' && result.value)).toEqual([
      30, 10, 20,
    ]);
  });

  it('keeps going when a task fails and reports the failure', async () => {
    const error = new Error('boom');

    const results = await runWithConcurrency([1, 2, 3], 2, async n => {
      if (n === 2) throw error;
      return n;
    });

    expect(results).toEqual([
      { status: 'fulfilled', value: 1 },
      { status: 'rejected', reason: error },
      { status: 'fulfilled', value: 3 },
    ]);
  });

  it('returns an empty list for no items', async () => {
    expect(await runWithConcurrency([], 10, async () => 1)).toEqual([]);
  });
});
