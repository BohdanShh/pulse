import { Monitor } from '../../monitors/entities/monitor.entity.js';

export function monitorRemovedMessage({ name }: Monitor): string {
  return `🗑 Monitor removed: ${name}`;
}
