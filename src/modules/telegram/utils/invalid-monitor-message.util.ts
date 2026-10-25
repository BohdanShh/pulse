export function invalidMonitorMessage(messages: string[]): string {
  return ['❌ Cannot add this monitor:', ...messages.map(message => `• ${message}`)].join('\n');
}
