export const welcomeMessage = (firstName: string) =>
  [
    `👋 Hi, ${firstName}!`,
    '',
    "I'm Pulse — I monitor your APIs and websites and let you know here when they go down or recover.",
    '',
    'Monitor management commands are coming soon.',
  ].join('\n');
