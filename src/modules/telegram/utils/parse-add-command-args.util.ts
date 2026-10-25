import { type AddCommandArgs } from '../types/add-command-args.type.js';
import { defaultMonitorName } from './default-monitor-name.util.js';

/** Parses `<url> [name]`. Returns null when there is no URL. */
export function parseAddCommandArgs(match: string): AddCommandArgs | null {
  const [url, ...nameWords] = match.trim().split(/\s+/);
  if (!url) return null;

  return { url, name: nameWords.join(' ') || defaultMonitorName(url) };
}
