/** Parses a monitor number from /list (1, 2, ...). Returns null for anything else. */
export function parseMonitorNumber(match: string): number | null {
  const trimmed = match.trim();
  if (!/^\d+$/.test(trimmed)) return null;

  const number = Number(trimmed);
  return number > 0 ? number : null;
}
