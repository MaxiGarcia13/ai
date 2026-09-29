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

const { AiRouter } = await import('../src/router.js');

const messages: ChatCompletionMessageParam[] = [{ role: 'user', content: 'hello' }];
const callerOptions = {
  model: 'caller-model',
  messages,
  stream: true,
} as ChatCompletionCreateParamsStreaming;

const options: AiRouterOptions = {
  fallback: ['groq', 'open-router'],
  providers: {
    'groq': { apiKey: 'groq-key' },
    'open-router': { apiKey: 'open-router-key' },
  },
};

describe('aiRouter', () => {
  beforeEach(() => {
    createMock.mockReset();
    OpenAIMock.mockClear();
  });

  it('returns a create function that resolves a successful completion', async () => {
    const response = { id: 'completion-1' };
    createMock.mockResolvedValueOnce(response);

    const client = AiRouter(options);

    expect(client.create).toBeTypeOf('function');
    expect(client.lastUsedProvider).toBeNull();

    const result = await client.create(messages, callerOptions);

    expect(result).toBe(response);
    expect(OpenAIMock).toHaveBeenCalledWith({
      apiKey: 'groq-key',
      baseURL: 'https://api.groq.com/openai/v1',
    });
  });

  it('falls through to the next provider when the first fails', async () => {
    const response = { id: 'completion-2' };
    createMock.mockRejectedValueOnce(new Error('groq down')).mockResolvedValueOnce(response);

    const client = AiRouter(options);
    const result = await client.create(messages, callerOptions);

    expect(result).toBe(response);
    expect(OpenAIMock).toHaveBeenCalledTimes(2);
    expect(OpenAIMock).toHaveBeenNthCalledWith(2, {
      apiKey: 'open-router-key',
      baseURL: 'https://openrouter.ai/api/v1',
    });
  });
});
