export function apiKeyIssuedMessage(key: string): string {
  return [
    '🔑 <b>Your new REST API key</b>',
    'For scripts and tools outside Telegram.',
    '',
    `<code>${key}</code>`,
    '',
    'Tap it to copy, then send it in the header:',
    '<code>Authorization: Bearer &lt;key&gt;</code>',
    '',
    "⚠️ It's shown only once. Your previous key no longer works.",
  ].join('\n');
}
