export type CheckStats = {
  checks: number;
  failures: number;
  avgResponseTimeMs: number | null;
  p95ResponseTimeMs: number | null;
};
