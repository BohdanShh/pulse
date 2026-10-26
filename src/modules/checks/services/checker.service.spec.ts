import { afterEach, describe, expect, it, vi } from 'vitest';

import { CheckerService } from './checker.service.js';

const target = { url: 'https://api.example.com/health', method: 'GET' } as const;

/** A fetch error like undici throws it: a TypeError with the system error code in `cause`. */
function networkError(code: string): TypeError {
  return new TypeError('fetch failed', { cause: { code } });
}

describe('CheckerService.check', () => {
  const service = new CheckerService();

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([200, 204, 301, 399])('counts status %i as ok', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })));

    const result = await service.check(target);

    expect(result).toMatchObject({ ok: true, statusCode: status, error: null });
  });

  it.each([404, 500, 503])('counts status %i as failed', async status => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status })));

    const result = await service.check(target);

    expect(result).toMatchObject({
      ok: false,
      statusCode: status,
      error: `Unexpected status code ${status}`,
    });
  });

  it('sends the monitor method and does not download the body', async () => {
    const response = new Response('a large body');
    const fetch = vi.fn().mockResolvedValue(response);
    vi.stubGlobal('fetch', fetch);

    await service.check({ ...target, method: 'HEAD' });

    expect(fetch).toHaveBeenCalledWith(target.url, expect.objectContaining({ method: 'HEAD' }));
    // The body stream is cancelled right away, so it can no longer be read
    expect(response.bodyUsed).toBe(true);
  });

  it('measures the response time', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null)));

    const { responseTimeMs } = await service.check(target);

    expect(Number.isInteger(responseTimeMs)).toBe(true);
    expect(responseTimeMs).toBeGreaterThanOrEqual(0);
  });

  it.each([
    ['ENOTFOUND', 'DNS lookup failed'],
    ['EAI_AGAIN', 'DNS lookup failed'],
    ['ECONNREFUSED', 'Connection refused'],
    ['ECONNRESET', 'Connection reset'],
    ['EHOSTUNREACH', 'Host unreachable'],
    ['UND_ERR_CONNECT_TIMEOUT', 'Timeout after 10000ms'],
    ['CERT_HAS_EXPIRED', 'TLS error: CERT_HAS_EXPIRED'],
  ])('turns network error %s into "%s"', async (code, message) => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(networkError(code)));

    const result = await service.check(target);

    expect(result).toMatchObject({ ok: false, statusCode: null, error: message });
  });

  it('reports a timeout when the request is aborted by the time limit', async () => {
    const timeout = new DOMException('The operation was aborted due to timeout', 'TimeoutError');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(timeout));

    const result = await service.check(target);

    expect(result.error).toBe('Timeout after 10000ms');
  });

  it('falls back to the original message for an unknown error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Invalid URL')));

    const result = await service.check(target);

    expect(result.error).toBe('Invalid URL');
  });
});
