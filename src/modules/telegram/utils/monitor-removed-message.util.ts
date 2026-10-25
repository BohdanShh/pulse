import { Monitor } from '../../monitors/entities/monitor.entity.js';
import { escapeHtml } from './escape-html.util.js';

export function monitorRemovedMessage({ name }: Monitor): string {
  return ['🗑 <b>Monitor removed</b>', escapeHtml(name)].join('\n');
}
