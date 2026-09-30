import { HttpError } from '@maxigarcia/ai-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { streamChatCompletion } from '../src/stream-chat-completion.js';

const messages = [{ role: 'user' as const, content: 'hello' }];
const requestBody = {
  messages,
  stream: true as const,
};

function ndjsonBody(chunks: object[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  const payload = chunks.map((chunk) => `${JSON.stringify(chunk)}\n`).join('');

  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(payload));
      controller.close();
    },
  });
}

describe('streamChatCompletion', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('posts messages as JSON and yields parsed stream chunks', async () => {
    const chunk = { id: 'chunk-1', object: 'chat.completion.chunk', choices: [] };
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(ndjsonBody([chunk]), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const stream = await streamChatCompletion('https://example.com/chat', {
      body: requestBody,
      headers: { Authorization: 'Bearer token' },
    });

    const received = [];
    for await (const value of stream) {
      received.push(value);
    }

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith('https://example.com/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token',
      },
    });
    expect(received).toEqual([chunk]);
  });

  it('throws AiClientError with the response error message when the request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({ error: 'quota exceeded' }, { status: 429 }),
      ),
    );

    await expect(
      streamChatCompletion('https://example.com/chat', { body: requestBody }),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toMatchObject({ message: 'quota exceeded', status: 429 });
      return true;
    });
  });

  it('falls back to a status message when the error body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('plain failure', {
          status: 500,
          headers: { 'Content-Type': 'text/plain' },
        }),
      ),
    );

    await expect(
      streamChatCompletion('https://example.com/chat', { body: requestBody }),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toMatchObject({
        message: 'Request failed: 500',
        status: 500,
      });
      return true;
    });
  });

  it('throws AiClientError when the response has no body', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(null, { status: 200 }),
      ),
    );

    await expect(
      streamChatCompletion('https://example.com/chat', { body: requestBody }),
    ).rejects.toSatisfy((error: unknown) => {
      expect(error).toBeInstanceOf(HttpError);
      expect(error).toMatchObject({
        message: 'Response has no body',
        status: 200,
      });
      return true;
    });
  });
});
