import { HELP_INTRO_MESSAGE } from '../constants/messages.constant.js';
import { type BotCommand } from '../types/bot-command.type.js';
import { escapeHtml } from './escape-html.util.js';

export function helpMessage(commands: BotCommand[]): string {
  const lines = commands.map(({ command, description, args }) =>
    [`/${command}`, args && `<i>${escapeHtml(args)}</i>`, '—', description]
      .filter(Boolean)
      .join(' '),
  );

  return [HELP_INTRO_MESSAGE, '', ...lines].join('\n');
}
