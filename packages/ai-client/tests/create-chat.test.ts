import { HttpError } from '@maxigarcia/ai-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createChat } from '../src/create-chat/index.js';

function contentChunk(text: string) {
  return {
    id: 'chunk-1',
    object: 'chat.completion.chunk',
    choices: [
      {
        index: 0,
        delta: { content: text },
        finish_reason: null,
      },
    ],
  };
}

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

describe('createChat', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('streams assistant content into messages and clears loading', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(ndjsonBody([
        contentChunk('Hello'),
        contentChunk(' world'),
      ]), {
        status: 200,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const chat = createChat({
      url: 'https://example.com/chat',
      headers: { Authorization: 'Bearer token' },
      body: { stream: true },
    });
    const snapshots: ReturnType<typeof chat.getState>[] = [];
    chat.subscribe(() => {
      snapshots.push(chat.getState());
    });

    await chat.send('Hi');

    expect(fetchMock).toHaveBeenCalledWith('https://example.com/chat', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({
        stream: true,
        messages: [
          { role: 'user', content: 'Hi' },
        ],
      }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token',
      },
    }));
    expect(chat.getState()).toEqual({
      messages: [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello world' },
      ],
      loading: false,
      error: null,
    });
    expect(snapshots.some((state) => state.loading)).toBe(true);
  });

  it('sets error on HTTP failure and keeps prior messages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({ error: 'quota exceeded' }, { status: 429 }),
      ),
    );

    const chat = createChat({
      url: 'https://example.com/chat',
      initialMessages: [
        { role: 'system', content: 'Be brief' },
      ],
    });

    await chat.send('Hi');

    const state = chat.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toBeInstanceOf(HttpError);
    expect(state.error).toMatchObject({ message: 'quota exceeded', status: 429 });
    expect(state.messages).toEqual([
      { role: 'system', content: 'Be brief' },
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: '' },
    ]);
  });

  it('sets error on mid-stream failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(ndjsonBody([
          { error: 'provider failed' },
        ]), { status: 200 }),
      ),
    );

    const chat = createChat({ url: 'https://example.com/chat' });
    await chat.send('Hi');

    const state = chat.getState();
    expect(state.loading).toBe(false);
    expect(state.error).toEqual(new Error('provider failed'));
  });

  it('stop aborts the request without setting error', async () => {
    let resolveRead: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      resolveRead = resolve;
    });

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        await gate;
        controller.close();
      },
    });

    const fetchMock = vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      init.signal?.addEventListener('abort', () => {
        // Abortable fetch surfaces AbortError when the body is read or request is cancelled.
      });

      return Promise.resolve(new Response(stream, { status: 200 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    const chat = createChat({ url: 'https://example.com/chat' });
    const sendPromise = chat.send('Hi');

    await vi.waitFor(() => {
      expect(chat.getState().loading).toBe(true);
    });

    chat.stop();
    resolveRead?.();
    await sendPromise;

    expect(chat.getState()).toMatchObject({
      loading: false,
      error: null,
    });
  });

  it('setMessages replaces history and clears error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({ error: 'fail' }, { status: 500 }),
      ),
    );

    const chat = createChat({ url: 'https://example.com/chat' });
    await chat.send('Hi');
    expect(chat.getState().error).not.toBeNull();

    chat.setMessages([
      { role: 'user', content: 'restart' },
    ]);

    expect(chat.getState()).toEqual({
      messages: [
        { role: 'user', content: 'restart' },
      ],
      loading: false,
      error: null,
    });
  });

  it('reset restores initialMessages and clears loading/error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        Response.json({ error: 'fail' }, { status: 500 }),
      ),
    );

    const initialMessages = [
      { role: 'system' as const, content: 'Be brief' },
    ];
    const chat = createChat({
      url: 'https://example.com/chat',
      initialMessages,
    });

    await chat.send('Hi');
    chat.reset();

    expect(chat.getState()).toEqual({
      messages: initialMessages,
      loading: false,
      error: null,
    });
  });
});
