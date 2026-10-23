export type CheckResult = {
  ok: boolean;
  statusCode: number | null;
  responseTimeMs: number;
  error: string | null;
};
