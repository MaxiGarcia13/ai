# @maxigarcia/ai-client

## What is it for?

Browser (or any `fetch`) client that streams AI chat completions from your HTTP endpoint over NDJSON.

Pair it with `@maxigarcia/ai-router`'s `writeNdjsonStream` on the server: the router encodes provider chunks as NDJSON lines, and this client parses them into OpenAI-style `ChatCompletionChunk` objects.

For UI state (`messages`, `loading`, `error`), use **`createChat`** — a framework-agnostic store you can wire into React, Vue, Svelte, or vanilla JS.

## Where to use it?

Use it in the **browser** or any environment with `fetch`. Point it at your own API route — never at provider APIs directly. Keys stay on the server with `@maxigarcia/ai-router`.

## How to use it?

```bash
npm install @maxigarcia/ai-client
```

### `createChat` (recommended for UIs)

Imperative chat session: keeps `messages` / `loading` / `error`, streams replies via `streamChatCompletion`, and exposes `subscribe` so any UI can re-render.

```ts
import { createChat } from '@maxigarcia/ai-client';

const chat = createChat({
  url: '/api/chat',
  // headers: { Authorization: 'Bearer …' },
  // initialMessages: [{ role: 'system', content: 'Be brief' }],
  // body: { stream: true }, // merged into the POST body with messages
});

chat.subscribe(() => {
  const { messages, loading, error } = chat.getState();
  // update your UI
});

await chat.send('Summarize this PR diff');
// chat.stop()
// chat.setMessages([...])
// chat.reset()
```

| Method / field          | Description                                                 |
| ----------------------- | ----------------------------------------------------------- |
| `getState()`            | Current `{ messages, loading, error }`                      |
| `subscribe(listener)`   | Call `listener` on every state change; returns unsubscribe  |
| `send(content)`         | Append user message, stream assistant reply into `messages` |
| `stop()`                | Abort the in-flight request; does not set `error`           |
| `setMessages(messages)` | Replace history and clear `error`                           |
| `reset()`               | Abort, restore `initialMessages` (or `[]`), clear `error`   |

**Options**

| Option            | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `url`             | Your chat API endpoint                                           |
| `headers`         | Extra headers (merged with `Content-Type: application/json`)     |
| `initialMessages` | Starting history (also used by `reset`)                          |
| `body`            | Extra JSON fields merged into the POST body alongside `messages` |

`send` posts the history **without** the empty assistant placeholder; deltas are folded into the last assistant message locally. Aborts are not treated as errors. Starting a new `send` while one is in flight aborts the previous request.

#### React

```ts
import type { ChatState } from '@maxigarcia/ai-client';
import { createChat } from '@maxigarcia/ai-client';
import { useEffect, useMemo, useState } from 'react';

function useChat(url: string) {
  const chat = useMemo(() => createChat({ url }), [url]);
  const [state, setState] = useState<ChatState>(chat.getState());

  useEffect(() => chat.subscribe(() => setState(chat.getState())), [chat]);

  return {
    ...state,
    send: chat.send,
    stop: chat.stop,
    setMessages: chat.setMessages,
    reset: chat.reset
  };
}
```

Or with `useSyncExternalStore`:

```ts
import { createChat } from '@maxigarcia/ai-client';
import { useMemo, useSyncExternalStore } from 'react';

function useChat(url: string) {
  const chat = useMemo(() => createChat({ url }), [url]);
  const state = useSyncExternalStore(chat.subscribe, chat.getState, chat.getState);

  return {
    ...state,
    send: chat.send,
    stop: chat.stop,
    setMessages: chat.setMessages,
    reset: chat.reset
  };
}
```

#### Vue

```ts
import { createChat } from '@maxigarcia/ai-client';
import { onScopeDispose, shallowRef } from 'vue';

export function useChat(url: string) {
  const chat = createChat({ url });
  const messages = shallowRef(chat.getState().messages);
  const loading = shallowRef(chat.getState().loading);
  const error = shallowRef(chat.getState().error);

  const unsubscribe = chat.subscribe(() => {
    const state = chat.getState();
    messages.value = state.messages;
    loading.value = state.loading;
    error.value = state.error;
  });

  onScopeDispose(unsubscribe);

  return {
    messages,
    loading,
    error,
    send: chat.send,
    stop: chat.stop,
    setMessages: chat.setMessages,
    reset: chat.reset,
  };
}
```

### `streamChatCompletion(url, options)`

Low-level helper: POSTs JSON to `url` and returns an async iterable of chat completion chunks from the NDJSON response body. Prefer `createChat` when you need conversation state.

```ts
import { streamChatCompletion } from '@maxigarcia/ai-client';
import { isHttpError } from '@maxigarcia/ai-utils';

try {
  const stream = await streamChatCompletion('/api/chat', {
    body: {
      messages: [
        { role: 'user', content: 'Summarize this PR diff' }
      ],
    },
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      // append to your UI
    }
  }
} catch (error) {
  if (isHttpError(error)) {
    console.error(error.message, error.status);
  }
  throw error;
}
```

| Option    | Description                                                                |
| --------- | -------------------------------------------------------------------------- |
| `body`    | Request body — must include `messages`; other OpenAI stream fields allowed |
| `headers` | Optional extra headers (merged with `Content-Type: application/json`)      |

Also accepts the rest of `RequestInit` except `body` / `headers` (e.g. `signal` for abort).

**Behavior**

1. Sends `POST` with `Content-Type: application/json` and `JSON.stringify(options.body)`
2. On non-OK responses, throws `HttpError` — uses `error` from a JSON body when present, otherwise `Request failed: <status>`
3. Throws `HttpError` when the response has no body
4. Parses each NDJSON line as a `ChatCompletionChunk`
5. If a line is `{ "error": "…" }` or `{ "error": { "message": "…" } }`, throws a normal `Error` with that message (mid-stream failure from `writeNdjsonStream`)

### Errors

| Case                         | Thrown as                         |
| ---------------------------- | --------------------------------- |
| Non-OK HTTP response         | `HttpError` (`message`, `status`) |
| Response has no body         | `HttpError`                       |
| NDJSON line with `{ error }` | `Error` with the error message    |
| Invalid JSON line            | `SyntaxError`                     |

`createChat` stores these on `state.error` instead of throwing to the caller of `send` (except you can still `await send` — it resolves after the stream ends or fails; check `getState().error`).

`HttpError` and `isHttpError` live in `@maxigarcia/ai-utils`:

```ts
import { HttpError, isHttpError } from '@maxigarcia/ai-utils';

if (error instanceof HttpError || isHttpError(error)) {
  // error.message, error.status
}
```
