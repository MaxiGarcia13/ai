# @maxigarcia/ai-client

## What is it for?

Browser (or any `fetch`) client that streams AI chat completions from your HTTP endpoint over NDJSON.

Pair it with `@maxigarcia/ai-router`'s `writeNdjsonStream` on the server: the router encodes provider chunks as NDJSON lines, and this client parses them into OpenAI-style `ChatCompletionChunk` objects.

## Where to use it?

Use it in the **browser** or any environment with `fetch`. Point it at your own API route — never at provider APIs directly. Keys stay on the server with `@maxigarcia/ai-router`.

## How to use it?

```bash
npm install @maxigarcia/ai-client
```

```ts
import { streamChatCompletion } from '@maxigarcia/ai-client';
import { isHttpError } from '@maxigarcia/ai-utils';

try {
  const stream = await streamChatCompletion('/api/chat', {
    body: {
      messages: [{ role: 'user', content: 'Summarize this PR diff' }],
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

### `streamChatCompletion(url, options)`

POSTs JSON to `url` and returns an async iterable of chat completion chunks from the NDJSON response body.

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

`HttpError` and `isHttpError` live in `@maxigarcia/ai-utils`:

```ts
import { HttpError, isHttpError } from '@maxigarcia/ai-utils';

if (error instanceof HttpError || isHttpError(error)) {
  // error.message, error.status
}
```
