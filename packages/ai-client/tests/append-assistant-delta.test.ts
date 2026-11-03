import { describe, expect, it } from 'vitest';
import { appendAssistantDelta } from '../src/create-chat/append-assistant-delta.js';

describe('appendAssistantDelta', () => {
  it('appends delta to the last assistant message', () => {
    expect(
      appendAssistantDelta(
        [
          { role: 'user', content: 'Hi' },
          { role: 'assistant', content: 'Hello' },
        ],
        ' world',
      ),
    ).toEqual([
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello world' },
    ]);
  });

  it('returns null when the last message is not an assistant', () => {
    expect(
      appendAssistantDelta([
        { role: 'user', content: 'Hi' },
      ], ' world'),
    ).toBeNull();
  });

  it('returns null for an empty messages list', () => {
    expect(appendAssistantDelta([], ' world')).toBeNull();
  });
});
