import { describe, expect, it } from 'vitest';

import { escapeHtml } from './escape-html.util.js';

describe('escapeHtml', () => {
  it('escapes the characters Telegram HTML treats as markup', () => {
    expect(escapeHtml('<b>Tom & Jerry</b>')).toBe('&lt;b&gt;Tom &amp; Jerry&lt;/b&gt;');
  });

  it('leaves a normal URL and quotes unchanged', () => {
    const url = 'https://example.com/search?q="pulse"&page=2';

    expect(escapeHtml(url)).toBe('https://example.com/search?q="pulse"&amp;page=2');
  });
});
