export const CHECK_TIMEOUT_MS = 10_000;
export const CHECK_USER_AGENT = 'Pulse/0.1 (+https://github.com/BohdanShh/pulse)';

export const OK_STATUS_MIN = 200;
export const OK_STATUS_MAX = 399;

export const NETWORK_ERROR_MESSAGES: Record<string, string> = {
  ENOTFOUND: 'DNS lookup failed',
  EAI_AGAIN: 'DNS lookup failed',
  ECONNREFUSED: 'Connection refused',
  ECONNRESET: 'Connection reset',
  EHOSTUNREACH: 'Host unreachable',
};

export const TIMEOUT_ERROR_CODES = ['UND_ERR_CONNECT_TIMEOUT'];

export const UNKNOWN_CHECK_ERROR_MESSAGE = 'Unknown error';

export const TLS_ERROR_CODE_PATTERN = /CERT|SSL|TLS|SELF_SIGNED|UNABLE_TO_VERIFY/;
