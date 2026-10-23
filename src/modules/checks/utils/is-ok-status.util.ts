import { OK_STATUS_MAX, OK_STATUS_MIN } from '../constants/checker.constant.js';

export function isOkStatus(statusCode: number): boolean {
  return statusCode >= OK_STATUS_MIN && statusCode <= OK_STATUS_MAX;
}
