import type { AiProviderName } from '@maxigarcia/ai-types';
import { describe, expect, it } from 'vitest';
import { getGroqProvider } from '../src/providers/groq.js';
import { getAiProvider } from '../src/providers/index.js';
import { getOpenRouterProvider } from '../src/providers/open-router.js';

const messages = [{ role: 'user' as const, content: 'hello' }];

describe('getGroqProvider', () => {
  it('returns client options with the given api key and groq base URL', () => {
    const provider = getGroqProvider('groq-key');

    expect(provider.getClientOptions('ignored')).toEqual({
      apiKey: 'groq-key',
      baseURL: 'https://api.groq.com/openai/v1',
    });
  });

  it('uses the default model and stream true', () => {
    const provider = getGroqProvider('groq-key');

    expect(provider.getCreateParams({ messages })).toEqual({
      model: 'openai/gpt-oss-120b',
      messages,
      stream: true,
    });
  });

  it('overrides the default model when one is provided', () => {
    const provider = getGroqProvider('groq-key');

    expect(provider.getCreateParams({ messages, model: 'openai/gpt-oss-120b' })).toEqual({
      model: 'openai/gpt-oss-120b',
      messages,
      stream: true,
    });
  });
});

describe('getOpenRouterProvider', () => {
  it('returns client options with the given api key and open-router base URL', () => {
    const provider = getOpenRouterProvider('open-router-key');

    expect(provider.getClientOptions('ignored')).toEqual({
      apiKey: 'open-router-key',
      baseURL: 'https://openrouter.ai/api/v1',
    });
  });

  it('uses the default model and stream true', () => {
    const provider = getOpenRouterProvider('open-router-key');

    expect(provider.getCreateParams({ messages })).toEqual({
      model: 'openrouter/free',
      messages,
      stream: true,
    });
  });

  it('overrides the default model when one is provided', () => {
    const provider = getOpenRouterProvider('open-router-key');

    expect(provider.getCreateParams({ messages, model: 'openrouter/free' })).toEqual({
      model: 'openrouter/free',
      messages,
      stream: true,
    });
  });
});

describe('getAiProvider', () => {
  it('returns the groq factory', () => {
    expect(getAiProvider('groq')).toBe(getGroqProvider);
  });

  it('returns the open-router factory', () => {
    expect(getAiProvider('open-router')).toBe(getOpenRouterProvider);
  });

  it('returns null when the name is undefined', () => {
    expect(getAiProvider()).toBeNull();
  });

  it('returns null for an unknown provider name', () => {
    expect(getAiProvider('unknown' as AiProviderName)).toBeNull();
  });
});
