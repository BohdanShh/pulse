import { CHECK_TIMEOUT_MS } from '../constants/checker.constant.js';

export const timeoutErrorMessage = () => `Timeout after ${CHECK_TIMEOUT_MS}ms`;

export const unexpectedStatusErrorMessage = (statusCode: number) =>
  `Unexpected status code ${statusCode}`;

export const tlsErrorMessage = (code: string) => `TLS error: ${code}`;
