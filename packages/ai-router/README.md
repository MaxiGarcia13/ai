# @maxigarcia/ai-router

## What is it for?

Routes chat completion requests across multiple AI providers (`gemini`, `groq`, `open-router`).

If one provider fails, the next in your `fallback` list is tried automatically. After a successful request, the next call starts from the last used provider so traffic is balanced across them.

It also provides `writeNdjsonStream` to turn the streamed completion into an NDJSON `ReadableStream` for HTTP responses — the format expected by `@maxigarcia/ai-client`.

## Where to use it?

Use it on the **server** — API routes, backend services, or any server-side code that holds provider API keys. Do not use it in the browser; keys must stay private.

### Get API keys

| Provider      | Get your key                                                                                    |
| ------------- | ----------------------------------------------------------------------------------------------- |
| `gemini`      | [Google AI Studio](https://aistudio.google.com/app/api-keys?project=gen-lang-client-0964537707) |
| `groq`        | [GroqCloud Console](https://console.groq.com/keys)                                              |
| `open-router` | [OpenRouter](https://openrouter.ai/workspaces/default/keys)                                     |

## How to use it?

```ts
import { AiRouter, writeNdjsonStream } from '@maxigarcia/ai-router';

// set up once on the server
const router = AiRouter({
  fallback: ['groq', 'open-router'],
  providers: {
    'groq': {
      apiKey: process.env.GROQ_API_KEY!,
      // optional — defaults to 'openai/gpt-oss-120b'
      model: 'openai/gpt-oss-120b',
    },
    'open-router': {
      apiKey: process.env.OPENROUTER_API_KEY!,
      // optional — defaults to 'openrouter/free'
      model: 'openrouter/free',
    },
  },
});

// Example: Node / Edge-style handler sketch
export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = await router.create(messages);
  const body = writeNdjsonStream(stream);

  return new Response(body, {
    headers: {
      'Content-Type': 'application/x-ndjson',
      'Cache-Control': 'no-cache',
    },
  });
}
```

### `AiRouter` options

| Option                   | Description                        |
| ------------------------ | ---------------------------------- |
| `fallback`               | Provider fallback / rotation order |
| `providers[name].apiKey` | Required API key for that provider |
| `providers[name].model`  | Optional model for that provider   |

### `router.create(messages, options?)`

Returns an `AsyncIterable` of chat completion chunks. The model comes from each provider's config — it is not passed per request.

| Option        | Description                              |
| ------------- | ---------------------------------------- |
| `messages`    | Chat messages (first argument)           |
| `stream`      | Stream the response — defaults to `true` |
| `temperature` | Sampling temperature                     |
| `max_tokens`  | Maximum tokens to generate               |
| `tools`       | Tool / function definitions              |

### `writeNdjsonStream(stream)`

Encodes an async iterable of chat completion chunks as NDJSON (`ReadableStream<Uint8Array>`).

- Each chunk is written as one JSON line
- If the iterable throws, writes a final `{ "error": "<message>" }` line and closes

Pair this with `@maxigarcia/ai-client`'s `readNdjsonStream` / `streamChatCompletion` on the client.

### Behavior

1. Tries providers in `fallback` (rotated from the last successful one when available).
2. On failure, moves to the next provider.
3. If every provider fails, rejects with an array of `AiRouterProviderError` (`{ providerName, error }`).
4. Trims conversation history to the model's context window before each call.
