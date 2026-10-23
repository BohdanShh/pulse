export function apiKeyIssuedMessage(key: string): string {
  return [
    '🔑 Your new API key:',
    '',
    `<code>${key}</code>`,
    '',
    'Tap it to copy. Send it in the <code>Authorization: Bearer &lt;key&gt;</code> header.',
    '',
    '⚠️ It is shown only once and your previous key no longer works.',
  ].join('\n');
}
