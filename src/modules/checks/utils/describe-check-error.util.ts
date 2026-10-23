import {
  NETWORK_ERROR_MESSAGES,
  TIMEOUT_ERROR_CODES,
  TLS_ERROR_CODE_PATTERN,
} from '../constants/checker.constant.js';
import { timeoutErrorMessage, tlsErrorMessage } from './check-error-message.util.js';

export function describeCheckError(error: unknown): string {
  if (!(error instanceof Error)) return 'Unknown error';
  if (error.name === 'TimeoutError') return timeoutErrorMessage();

  const cause = error.cause as { code?: string; message?: string } | undefined;
  const code = cause?.code;

  if (code) {
    if (TIMEOUT_ERROR_CODES.includes(code)) return timeoutErrorMessage();
    if (NETWORK_ERROR_MESSAGES[code]) return NETWORK_ERROR_MESSAGES[code];
    if (TLS_ERROR_CODE_PATTERN.test(code)) return tlsErrorMessage(code);
  }

  return cause?.message ?? error.message;
}
