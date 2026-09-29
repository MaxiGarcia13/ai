import type { ChatCompletionMessageParam } from 'openai/resources.js';
import { describe, expect, it } from 'vitest';
import { trimMessagesToContext } from '../src/trim-messages-to-context.js';

const overhead = 32;

function user(content: string): ChatCompletionMessageParam {
  return { role: 'user', content };
}

function assistant(content: string): ChatCompletionMessageParam {
  return { role: 'assistant', content };
}

describe('trimMessagesToContext', () => {
  it('returns all messages when they fit in the context window', () => {
    const messages = [user('hello'), assistant('hi'), user('how are you?')];

    const result = trimMessagesToContext({
      messages,
      systemPrompt: 'You are helpful.',
    });

    expect(result).toEqual(messages);
  });

  it('returns an empty array when there are no messages', () => {
    const result = trimMessagesToContext({
      messages: [],
      systemPrompt: 'system',
    });

    expect(result).toEqual([]);
  });

  it('keeps the most recent messages that fit and drops older ones', () => {
    const messages = [
      user('aaaa'),
      user('bb'),
      user('c'),
    ];

    const result = trimMessagesToContext({
      messages,
      systemPrompt: '0123456789',
      contextWindowSize: 100,
      maxOutputTokens: 0,
      charsPerToken: 1,
      chatTemplateOverheadChars: overhead,
    });

    expect(result).toEqual([user('c')]);
  });

  it('keeps multiple recent messages when they fit together', () => {
    const messages = [
      user('old'),
      user('a'),
      user('b'),
    ];

    const result = trimMessagesToContext({
      messages,
      systemPrompt: '',
      contextWindowSize: 100,
      maxOutputTokens: 0,
      charsPerToken: 1,
      chatTemplateOverheadChars: overhead,
    });

    expect(result).toEqual([user('a'), user('b')]);
  });

  it('truncates the newest message to the remaining content budget', () => {
    const messages = [user('ABCDEFGHIJKLMNOPQRSTUVWXYZ')];

    const result = trimMessagesToContext({
      messages,
      systemPrompt: '',
      contextWindowSize: 70,
      maxOutputTokens: 0,
      charsPerToken: 1,
      chatTemplateOverheadChars: overhead,
    });

    expect(result).toEqual([user('UVWXYZ')]);
  });

  it('drops a leading assistant message after trimming', () => {
    const messages = [
      user('first'),
      assistant('reply'),
      user('second'),
    ];

    const result = trimMessagesToContext({
      messages,
      systemPrompt: '',
      contextWindowSize: 110,
      maxOutputTokens: 0,
      charsPerToken: 1,
      chatTemplateOverheadChars: overhead,
    });

    expect(result).toEqual([user('second')]);
  });

  it('keeps a leading user message even when an assistant follows', () => {
    const messages = [user('ask'), assistant('ans')];

    const result = trimMessagesToContext({
      messages,
      systemPrompt: '',
      contextWindowSize: 200,
      maxOutputTokens: 0,
      charsPerToken: 1,
      chatTemplateOverheadChars: overhead,
    });

    expect(result).toEqual(messages);
  });

  it('falls back to the last user message when the system prompt leaves almost no budget', () => {
    const messages = [
      assistant('ignored'),
      user('ABCDEFGHIJKLMNOP'),
    ];

    const result = trimMessagesToContext({
      messages,
      systemPrompt: '01234567890123456789',
      contextWindowSize: 40,
      maxOutputTokens: 0,
      charsPerToken: 1,
      chatTemplateOverheadChars: overhead,
    });

    expect(result).toEqual([user('ABCDEFGHIJKLMNOP')]);
  });

  it('returns an empty array when budget is exhausted and there is no user message', () => {
    const result = trimMessagesToContext({
      messages: [assistant('only assistant')],
      systemPrompt: '01234567890123456789',
      contextWindowSize: 40,
      maxOutputTokens: 0,
      charsPerToken: 1,
      chatTemplateOverheadChars: overhead,
    });

    expect(result).toEqual([]);
  });

  it('treats non-string message content as empty for sizing', () => {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'user', content: [{ type: 'text', text: 'ignored by sizer' }] },
      user('kept'),
    ];

    const result = trimMessagesToContext({
      messages,
      systemPrompt: '',
      contextWindowSize: 80,
      maxOutputTokens: 0,
      charsPerToken: 1,
      chatTemplateOverheadChars: overhead,
    });

    expect(result).toEqual([user('kept')]);
  });
});
