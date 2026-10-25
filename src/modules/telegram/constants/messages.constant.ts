export const API_KEY_REVOKED_MESSAGE =
  '🔒 Your API key has been revoked. Requests with it will be rejected.';

/** MarkdownV2: outside code blocks, characters like . - ( ) ! must be escaped with a backslash. */
export const ADD_USAGE_MESSAGE = [
  'To add a monitor, send /add followed by the URL:',
  '```bash',
  '/add https://example.com',
  '```',
  '',
  'Optionally, give it a name:',
  '```bash',
  '/add https://api.github.com GitHub API',
  '```',
].join('\n');

export const NO_ACTIVE_API_KEY_MESSAGE = 'You have no active API key. Send /apikey to get one.';

export const NO_MONITORS_MESSAGE = 'You have no monitors yet. Send /add to add one.';

/** MarkdownV2, see ADD_USAGE_MESSAGE. */
export const REMOVE_USAGE_MESSAGE = [
  'To remove a monitor, send /remove followed by its number from /list:',
  '```bash',
  '/remove 2',
  '```',
].join('\n');
