import type { AiProviderName } from '@maxigarcia/ai-types';
import type { ChatCompletionCreateParamsStreaming, ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { AiRouterOptions } from '../src/types.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const createMock = vi.fn();

class OpenAI {
  chat = {
    completions: {
      create: createMock,
    },
  };
}

const OpenAIMock = vi.fn(OpenAI);

vi.mock('openai', () => ({
  default: OpenAIMock,
}));

const { createAiRequest } = await import('../src/create.js');

const messages: ChatCompletionMessageParam[] = [{ role: 'user', content: 'hello' }];
const callerOptions = {
  model: 'caller-model',
  messages,
  stream: true,
} as ChatCompletionCreateParamsStreaming;

const baseOptions: AiRouterOptions<['groq', 'open-router']> = {
  fallback: ['groq', 'open-router'],
  providers: {
    'groq': { apiKey: 'groq-key' },
    'open-router': { apiKey: 'open-router-key' },
  },
};

describe('createAiRequest', () => {
  beforeEach(() => {
    createMock.mockReset();
    OpenAIMock.mockClear();
  });

  it('uses the first provider when it succeeds and records it as last used', async () => {
    const response = { id: 'completion-1' };
    createMock.mockResolvedValueOnce(response);
    const setLastUsedProvider = vi.fn();

    const create = createAiRequest(baseOptions, null, setLastUsedProvider);
    const result = await create(messages, callerOptions);

    expect(OpenAIMock).toHaveBeenCalledTimes(1);
    expect(OpenAIMock).toHaveBeenCalledWith({
      apiKey: 'groq-key',
      baseURL: 'https://api.groq.com/openai/v1',
    });
    expect(createMock).toHaveBeenCalledWith({
      model: 'caller-model',
      messages,
      stream: true,
    });
    expect(result).toBe(response);
    expect(setLastUsedProvider).toHaveBeenCalledWith('groq');
  });

  it('falls through to the next provider when the first create rejects', async () => {
    const firstError = new Error('groq down');
    const response = { id: 'completion-2' };
    createMock.mockRejectedValueOnce(firstError).mockResolvedValueOnce(response);
    const setLastUsedProvider = vi.fn();

    const create = createAiRequest(baseOptions, null, setLastUsedProvider);
    const result = await create(messages, callerOptions);

    expect(OpenAIMock).toHaveBeenCalledTimes(2);
    expect(OpenAIMock).toHaveBeenNthCalledWith(1, {
      apiKey: 'groq-key',
      baseURL: 'https://api.groq.com/openai/v1',
    });
    expect(OpenAIMock).toHaveBeenNthCalledWith(2, {
      apiKey: 'open-router-key',
      baseURL: 'https://openrouter.ai/api/v1',
    });
    expect(result).toBe(response);
    expect(setLastUsedProvider).toHaveBeenCalledTimes(1);
    expect(setLastUsedProvider).toHaveBeenCalledWith('open-router');
  });

  it('tries providers in rotated order when lastUsedProvider is set', async () => {
    const response = { id: 'completion-3' };
    createMock.mockResolvedValueOnce(response);
    const setLastUsedProvider = vi.fn();

    const create = createAiRequest(baseOptions, 'open-router', setLastUsedProvider);
    await create(messages, callerOptions);

    expect(OpenAIMock).toHaveBeenCalledTimes(1);
    expect(OpenAIMock).toHaveBeenCalledWith({
      apiKey: 'open-router-key',
      baseURL: 'https://openrouter.ai/api/v1',
    });
    expect(setLastUsedProvider).toHaveBeenCalledWith('open-router');
  });

  it('rejects with all provider errors when every create fails', async () => {
    const groqError = new Error('groq failed');
    const openRouterError = new Error('open-router failed');
    createMock.mockRejectedValueOnce(groqError).mockRejectedValueOnce(openRouterError);
    const setLastUsedProvider = vi.fn();

    const create = createAiRequest(baseOptions, null, setLastUsedProvider);

    await expect(create(messages, callerOptions)).rejects.toEqual([
      { providerName: 'groq', error: groqError },
      { providerName: 'open-router', error: openRouterError },
    ]);
    expect(setLastUsedProvider).not.toHaveBeenCalled();
  });

  it('throws when the api key is missing and does not call OpenAI', async () => {
    const setLastUsedProvider = vi.fn();
    const options: AiRouterOptions<['groq', 'open-router']> = {
      fallback: ['groq', 'open-router'],
      providers: {
        'groq': { apiKey: '' },
        'open-router': { apiKey: 'open-router-key' },
      },
    };

    const create = createAiRequest(options, null, setLastUsedProvider);

    await expect(create(messages, callerOptions)).rejects.toThrow(
      'API key for provider groq not found',
    );
    expect(OpenAIMock).not.toHaveBeenCalled();
    expect(setLastUsedProvider).not.toHaveBeenCalled();
  });

  it('throws when the provider name is unknown', async () => {
    const setLastUsedProvider = vi.fn();
    const options: AiRouterOptions = {
      fallback: ['unknown' as AiProviderName],
      providers: {
        'groq': { apiKey: 'groq-key' },
        'open-router': { apiKey: 'open-router-key' },
        ...({ unknown: { apiKey: 'unknown-key' } } as object),
      } as AiRouterOptions['providers'],
    };

    const create = createAiRequest(options, null, setLastUsedProvider);

    await expect(create(messages, callerOptions)).rejects.toThrow(
      'Provider unknown not found',
    );
    expect(OpenAIMock).not.toHaveBeenCalled();
  });
});
