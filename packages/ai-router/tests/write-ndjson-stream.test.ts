import type { ChatCompletionChunk } from 'openai/resources';
import { describe, expect, it } from 'vitest';
import { writeNdjsonStream } from '../src/write-ndjson-stream.js';

const chunkA = {
  id: 'chunk-a',
  object: 'chat.completion.chunk',
  choices: [],
} as ChatCompletionChunk;

const chunkB = {
  id: 'chunk-b',
  object: 'chat.completion.chunk',
  choices: [],
} as ChatCompletionChunk;

async function* asAsyncIterable(
  chunks: ChatCompletionChunk[],
): AsyncIterable<ChatCompletionChunk> {
  for (const chunk of chunks) {
    yield chunk;
  }
}

async function readText(stream: ReadableStream<Uint8Array>): Promise<string> {
  return new Response(stream).text();
}

describe('writeNdjsonStream', () => {
  it('encodes each chunk as a newline-delimited JSON line', async () => {
    const body = writeNdjsonStream(asAsyncIterable([chunkA, chunkB]));

    await expect(readText(body)).resolves.toBe(
      `${JSON.stringify(chunkA)}\n${JSON.stringify(chunkB)}\n`,
    );
  });

  it('writes an empty stream as an empty body', async () => {
    const body = writeNdjsonStream(asAsyncIterable([]));

    await expect(readText(body)).resolves.toBe('');
  });

  it('writes an error line and closes when the iterable throws an Error', async () => {
    async function* failing(): AsyncIterable<ChatCompletionChunk> {
      yield chunkA;
      throw new Error('provider down');
    }

    const body = writeNdjsonStream(failing());

    await expect(readText(body)).resolves.toBe(
      `${JSON.stringify(chunkA)}\n${JSON.stringify({ error: 'provider down' })}\n`,
    );
  });

  it('uses a default message when the iterable throws a non-Error', async () => {
    async function* failing(): AsyncIterable<ChatCompletionChunk> {
      throw 'boom';
    }

    const body = writeNdjsonStream(failing());

    await expect(readText(body)).resolves.toBe(
      `${JSON.stringify({ error: 'Request failed' })}\n`,
    );
  });
});
