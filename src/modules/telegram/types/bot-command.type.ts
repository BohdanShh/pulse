export type BotCommand = {
  command: string;
  description: string;
  /** Shown only in /help, e.g. "<url> [name]". Not sent to Telegram. */
  args?: string;
};
