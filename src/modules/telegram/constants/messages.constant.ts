// All messages are sent with parse_mode HTML: escape user input with escapeHtml().

export const API_KEY_REVOKED_MESSAGE = [
  '🔒 <b>REST API key revoked</b>',
  'The bot keeps working as usual.',
].join('\n');

export const NO_ACTIVE_API_KEY_MESSAGE = [
  'ℹ️ You have no active REST API key.',
  'Send /apikey to get one.',
].join('\n');

export const ADD_USAGE_MESSAGE = [
  '➕ <b>Add a monitor</b>',
  '',
  'Send /add followed by the URL:',
  '<pre><code class="language-bash">/add https://example.com</code></pre>',
  'Optionally, give it a name:',
  '<pre><code class="language-bash">/add https://api.github.com GitHub API</code></pre>',
].join('\n');

export const STATUS_USAGE_MESSAGE = [
  '🔍 <b>Monitor status</b>',
  '',
  'Send /status followed by the monitor number from /list:',
  '<pre><code class="language-bash">/status 1</code></pre>',
].join('\n');

export const REMOVE_USAGE_MESSAGE = [
  '🗑 <b>Remove a monitor</b>',
  '',
  'Send /remove followed by the monitor number from /list:',
  '<pre><code class="language-bash">/remove 2</code></pre>',
].join('\n');

export const NO_MONITORS_MESSAGE = ['📭 You have no monitors yet.', 'Send /add to add one.'].join(
  '\n',
);

export const HELP_INTRO_MESSAGE = [
  '📖 <b>Pulse commands</b>',
  'Pulse checks your URLs and tells you here when they go down or recover.',
].join('\n');
