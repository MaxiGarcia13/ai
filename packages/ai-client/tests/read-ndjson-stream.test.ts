import type { ChatCompletionChunk } from 'openai/resources.js';
import { describe, expect, it } from 'vitest';
import { AiClientError } from '../src/ai-client-error.js';
import { readNdjsonStream } from '../src/read-ndjson-stream.js';

function streamFrom(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream({
    pull(controller) {
      if (index >= chunks.length) {
        controller.close();
        return;
      }

      controller.enqueue(encoder.encode(chunks[index]));
      index += 1;
    },
  });
}

async function collect(
  body: ReadableStream<Uint8Array>,
): Promise<ChatCompletionChunk[]> {
  const chunks: ChatCompletionChunk[] = [];

  for await (const chunk of readNdjsonStream(body)) {
    chunks.push(chunk);
  }

  return chunks;
}

const chunkA = { id: 'chunk-a', object: 'chat.completion.chunk', choices: [] };
const chunkB = { id: 'chunk-b', object: 'chat.completion.chunk', choices: [] };

describe('readNdjsonStream', () => {
  it('yields parsed JSON objects from complete NDJSON lines', async () => {
    const body = streamFrom([`${JSON.stringify(chunkA)}\n${JSON.stringify(chunkB)}\n`]);

    await expect(collect(body)).resolves.toEqual([chunkA, chunkB]);
  });

  it('reassembles objects split across multiple stream chunks', async () => {
    const line = `${JSON.stringify(chunkA)}\n`;
    const midpoint = Math.floor(line.length / 2);
    const body = streamFrom([line.slice(0, midpoint), line.slice(midpoint)]);

    await expect(collect(body)).resolves.toEqual([chunkA]);
  });

  it('skips blank lines between objects', async () => {
    const body = streamFrom([`\n${JSON.stringify(chunkA)}\n\n${JSON.stringify(chunkB)}\n`]);

    await expect(collect(body)).resolves.toEqual([chunkA, chunkB]);
  });

  it('yields a trailing object that is not newline-terminated', async () => {
    const body = streamFrom([JSON.stringify(chunkA)]);

    await expect(collect(body)).resolves.toEqual([chunkA]);
  });

  it('throws AiClientError when a line contains a string error', async () => {
    const body = streamFrom([`${JSON.stringify({ error: 'provider down' })}\n`]);

    await expect(collect(body)).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(AiClientError);
      expect(error).toMatchObject({ message: 'provider down' });
      return true;
    });
  });

  it('throws AiClientError using the nested error message when present', async () => {
    const body = streamFrom([
      `${JSON.stringify({ error: { message: 'rate limited' } })}\n`,
    ]);

    await expect(collect(body)).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(AiClientError);
      expect(error).toMatchObject({ message: 'rate limited' });
      return true;
    });
  });

  it('throws AiClientError with a default message when error has no message', async () => {
    const body = streamFrom([`${JSON.stringify({ error: {} })}\n`]);

    await expect(collect(body)).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(AiClientError);
      expect(error).toMatchObject({ message: 'Request failed' });
      return true;
    });
  });

  it('throws when a line is not valid JSON', async () => {
    const body = streamFrom(['not-json\n']);

    await expect(collect(body)).rejects.toThrow(SyntaxError);
  });

  it('releases the reader lock after iteration finishes', async () => {
    const body = streamFrom([`${JSON.stringify(chunkA)}\n`]);

    await collect(body);

    expect(() => body.getReader()).not.toThrow();
  });
});
