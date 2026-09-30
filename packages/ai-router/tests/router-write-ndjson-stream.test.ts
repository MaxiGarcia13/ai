import type { ChatCompletionChunk } from 'openai/resources';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { AiRouterOptions } from '../src/types.js';
import { AiError } from '@maxigarcia/ai-utils';
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
const { writeNdjsonStream } = await import('../src/write-ndjson-stream.js');

const messages: ChatCompletionMessageParam[] = [{ role: 'user', content: 'hello' }];

const options: AiRouterOptions<['groq', 'open-router']> = {
  fallback: ['groq', 'open-router'],
  providers: {
    'groq': { apiKey: 'groq-key' },
    'open-router': { apiKey: 'open-router-key' },
  },
};

const chunkA = {
  id: 'chunk-a',
  object: 'chat.completion.chunk',
  choices: [{ index: 0, delta: { content: 'Hel' }, finish_reason: null }],
} as ChatCompletionChunk;

const chunkB = {
  id: 'chunk-b',
  object: 'chat.completion.chunk',
  choices: [{ index: 0, delta: { content: 'lo' }, finish_reason: 'stop' }],
} as ChatCompletionChunk;

async function* asAsyncIterable(
  chunks: ChatCompletionChunk[],
): AsyncIterable<ChatCompletionChunk> {
  for (const chunk of chunks) {
    yield chunk;
  }
}

async function readText(body: BodyInit): Promise<string> {
  return new Response(body).text();
}

describe('aiRouter + writeNdjsonStream', () => {
  beforeEach(() => {
    createMock.mockReset();
    OpenAIMock.mockClear();
  });

  it('streams router.create chunks as NDJSON through writeNdjsonStream', async () => {
    createMock.mockResolvedValueOnce(asAsyncIterable([chunkA, chunkB]));

    const router = AiRouter(options);
    const stream = await router.create(messages);
    const body = writeNdjsonStream(stream as AsyncIterable<ChatCompletionChunk>);

    await expect(readText(body)).resolves.toBe(
      `${JSON.stringify(chunkA)}\n${JSON.stringify(chunkB)}\n`,
    );
    expect(OpenAIMock).toHaveBeenCalledWith({
      apiKey: 'groq-key',
      baseURL: 'https://api.groq.com/openai/v1',
    });
  });

  it('falls through to the next provider and still writes NDJSON', async () => {
    createMock
      .mockRejectedValueOnce(new Error('groq down'))
      .mockResolvedValueOnce(asAsyncIterable([chunkA]));

    const router = AiRouter(options);
    const stream = await router.create(messages);
    const body = writeNdjsonStream(stream as AsyncIterable<ChatCompletionChunk>);

    await expect(readText(body)).resolves.toBe(`${JSON.stringify(chunkA)}\n`);
    expect(OpenAIMock).toHaveBeenCalledTimes(2);
    expect(OpenAIMock).toHaveBeenNthCalledWith(2, {
      apiKey: 'open-router-key',
      baseURL: 'https://openrouter.ai/api/v1',
    });
  });

  it('writes an error line when the provider stream fails mid-flight', async () => {
    async function* failing(): AsyncIterable<ChatCompletionChunk> {
      yield chunkA;
      throw new Error('stream interrupted');
    }

    createMock.mockResolvedValueOnce(failing());

    const router = AiRouter(options);
    const stream = await router.create(messages);
    const body = writeNdjsonStream(stream as AsyncIterable<ChatCompletionChunk>);

    await expect(readText(body)).resolves.toBe(
      `${JSON.stringify(chunkA)}\n${JSON.stringify({ error: 'stream interrupted' })}\n`,
    );
  });

  it('rejects with all provider errors when every create fails', async () => {
    const groqError = { status: 429, message: 'groq failed' };
    const openRouterError = { status: 500, message: 'open-router failed' };

    createMock
      .mockRejectedValueOnce(groqError)
      .mockRejectedValueOnce(openRouterError);

    const router = AiRouter(options);

    await expect(router.create(messages)).rejects.toEqual([
      new AiError(groqError.message, groqError.status, 'groq'),
      new AiError(openRouterError.message, openRouterError.status, 'open-router'),
    ]);
  });
});
