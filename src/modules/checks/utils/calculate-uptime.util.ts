export function calculateUptimePercent(checks: number, failures: number): number | null {
  if (checks === 0) return null;

  const percent = ((checks - failures) / checks) * 100;
  return Math.round(percent * 100) / 100;
}
