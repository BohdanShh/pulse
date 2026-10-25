import { Injectable } from '@nestjs/common';

import { Monitor } from '../../monitors/entities/monitor.entity.js';
import { type CheckResult } from '../types/check-result.type.js';

const CHECK_TIMEOUT_MS = 10_000;

@Injectable()
export class CheckerService {
  async check({ url, method }: Pick<Monitor, 'url' | 'method'>): Promise<CheckResult> {
    const startedAt = performance.now();
    const elapsed = () => Math.round(performance.now() - startedAt);

    try {
      const response = await fetch(url, {
        method,
        redirect: 'follow',
        signal: AbortSignal.timeout(CHECK_TIMEOUT_MS),
        headers: { 'User-Agent': 'Pulse/0.1 (+https://github.com/BohdanShh/pulse)' },
      });
      const responseTimeMs = elapsed();
      await response.body?.cancel();

      const ok = response.status >= 200 && response.status <= 399;

      return {
        ok,
        statusCode: response.status,
        responseTimeMs,
        error: ok ? null : `Unexpected status code ${response.status}`,
      };
    } catch (error) {
      return {
        ok: false,
        statusCode: null,
        responseTimeMs: elapsed(),
        error: this.describeError(error),
      };
    }
  }

  private describeError(error: unknown): string {
    const timeout = `Timeout after ${CHECK_TIMEOUT_MS}ms`;

    if (!(error instanceof Error)) return 'Unknown error';
    if (error.name === 'TimeoutError') return timeout;

    const cause = error.cause as { code?: string; message?: string } | undefined;
    const code = cause?.code;

    if (code === 'UND_ERR_CONNECT_TIMEOUT') return timeout;
    if (code === 'ENOTFOUND' || code === 'EAI_AGAIN') return 'DNS lookup failed';
    if (code === 'ECONNREFUSED') return 'Connection refused';
    if (code === 'ECONNRESET') return 'Connection reset';
    if (code === 'EHOSTUNREACH') return 'Host unreachable';
    if (code && /CERT|SSL|TLS|SELF_SIGNED|UNABLE_TO_VERIFY/.test(code)) return `TLS error: ${code}`;

    return cause?.message ?? error.message;
  }
}
