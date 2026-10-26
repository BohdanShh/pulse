import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';

import { CreateMonitorDto } from './create-monitor.dto.js';

/** Validates a plain object the way the bot does and returns the names of the invalid fields. */
async function invalidFields(input: object): Promise<string[]> {
  const errors = await validate(plainToInstance(CreateMonitorDto, input));
  return errors.map(error => error.property);
}

const VALID = { name: 'GitHub API', url: 'https://api.github.com' };

describe('CreateMonitorDto', () => {
  it('accepts a name and a URL', async () => {
    expect(await invalidFields(VALID)).toEqual([]);
  });

  it.each(['not-a-url', 'api.github.com', 'ftp://example.com', 'javascript:alert(1)'])(
    'rejects the URL "%s"',
    async url => {
      expect(await invalidFields({ ...VALID, url })).toEqual(['url']);
    },
  );

  it('rejects an empty name', async () => {
    expect(await invalidFields({ ...VALID, name: '' })).toEqual(['name']);
  });

  it('rejects an unknown HTTP method', async () => {
    expect(await invalidFields({ ...VALID, method: 'FETCH' })).toEqual(['method']);
  });

  it.each([29, 3601, 60.5])('rejects an interval of %s seconds', async intervalSeconds => {
    expect(await invalidFields({ ...VALID, intervalSeconds })).toEqual(['intervalSeconds']);
  });

  it.each([30, 3600])('accepts an interval of %s seconds', async intervalSeconds => {
    expect(await invalidFields({ ...VALID, intervalSeconds })).toEqual([]);
  });
});
