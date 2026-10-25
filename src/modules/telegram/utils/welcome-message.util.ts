export function welcomeMessage(firstName: string): string {
  return [
    `👋 Hi, ${firstName}!`,
    '',
    "I'm Pulse — I monitor your APIs and websites and let you know here when they go down or recover.",
    '',
    'Send /add <url> to start monitoring a URL, or /apikey to get a key for the REST API.',
  ].join('\n');
}
