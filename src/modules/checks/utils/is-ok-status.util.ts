import { OK_STATUS_MAX, OK_STATUS_MIN } from '../constants/checker.constant.js';

export const isOkStatus = (statusCode: number) =>
  statusCode >= OK_STATUS_MIN && statusCode <= OK_STATUS_MAX;
