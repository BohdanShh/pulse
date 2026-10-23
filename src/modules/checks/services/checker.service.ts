import { Injectable } from '@nestjs/common';

import { Monitor } from '../../monitors/entities/monitor.entity.js';
import { CHECK_TIMEOUT_MS, CHECK_USER_AGENT } from '../constants/checker.constant.js';
import { type CheckResult } from '../types/check-result.type.js';
import { unexpectedStatusErrorMessage } from '../utils/check-error-message.util.js';
import { describeCheckError } from '../utils/describe-check-error.util.js';
import { isOkStatus } from '../utils/is-ok-status.util.js';

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
        headers: { 'User-Agent': CHECK_USER_AGENT },
      });
      const responseTimeMs = elapsed();
      await response.body?.cancel();

      const ok = isOkStatus(response.status);

      return {
        ok,
        statusCode: response.status,
        responseTimeMs,
        error: ok ? null : unexpectedStatusErrorMessage(response.status),
      };
    } catch (error) {
      return {
        ok: false,
        statusCode: null,
        responseTimeMs: elapsed(),
        error: describeCheckError(error),
      };
    }
  }
}
