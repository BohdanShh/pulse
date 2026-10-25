import { Monitor } from '../../monitors/entities/monitor.entity.js';

export function monitorAddedMessage({ name, url, method, intervalSeconds }: Monitor): string {
  return [
    `✅ Monitor added: ${name}`,
    '',
    `${method} ${url}`,
    `Checked every ${intervalSeconds}s. The first check runs within a few seconds.`,
  ].join('\n');
}
