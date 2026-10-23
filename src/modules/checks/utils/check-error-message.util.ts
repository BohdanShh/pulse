import { CHECK_TIMEOUT_MS } from '../constants/checker.constant.js';

export function timeoutErrorMessage(): string {
  return `Timeout after ${CHECK_TIMEOUT_MS}ms`;
}

export function unexpectedStatusErrorMessage(statusCode: number): string {
  return `Unexpected status code ${statusCode}`;
}

export function tlsErrorMessage(code: string): string {
  return `TLS error: ${code}`;
}
