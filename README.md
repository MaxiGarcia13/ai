# AI

Lightweight, fault-tolerant toolkit that routes AI chat completions across multiple providers — with automatic fallback, balanced traffic, and a streaming browser client.

Use it when you want one API surface over several providers (`gemini`, `groq`, `open-router`), keep API keys on the server, and stream responses to the client without locking yourself to a single vendor.

## Why this exists

Provider outages, rate limits, and quota errors are common. Hard-coding a single SDK means every failure becomes your users' failure.

This monorepo gives you:

- **Server-side routing** — try providers in order, rotate after success, fail over automatically
- **NDJSON HTTP streaming** — `writeNdjsonStream` on the server, `streamChatCompletion` in the browser
- **Shared types & utils** — consistent provider names, defaults, and context trimming

```
┌─────────────┐     POST /chat      ┌──────────────────┐     fallback / rotate     ┌────────────┐
│  Browser    │ ──────────────────► │  Your API route  │ ─────────────────────────► │  Gemini    │
│  ai-client  │ ◄── NDJSON stream ─ │  + ai-router     │                           │  Groq      │
└─────────────┘                     └──────────────────┘                           │  OpenRouter│
                                                                                    └────────────┘
```

## Packages

| Package                                         | Role                                                        | Where it runs                |
| ----------------------------------------------- | ----------------------------------------------------------- | ---------------------------- |
| [`@maxigarcia/ai-router`](./packages/ai-router) | Routes requests across providers; encodes streams as NDJSON | **Server only**              |
| [`@maxigarcia/ai-client`](./packages/ai-client) | Streams chat completions from your HTTP endpoint            | Browser / any `fetch` client |
| [`@maxigarcia/ai-types`](./packages/ai-types)   | Shared provider names and default models                    | Server & client              |
| [`@maxigarcia/ai-utils`](./packages/ai-utils)   | Message/context helpers (e.g. trim to context window)       | Server                       |

## How to implement it

Typical setup: `ai-router` behind an API route that holds the keys, `ai-client` in the frontend posting messages and reading the stream.

### 1. Server — `@maxigarcia/ai-router`

Install:

```bash
npm install @maxigarcia/ai-router
```

Get API keys for the providers you want:

| Provider      | Get your key                                                 |
| ------------- | ------------------------------------------------------------ |
| `gemini`      | [Google AI Studio](https://aistudio.google.com/app/api-keys) |
| `groq`        | [GroqCloud Console](https://console.groq.com/keys)           |
| `open-router` | [OpenRouter](https://openrouter.ai/keys)                     |

Create the router once (API route, backend service, or server entrypoint). Keep keys in environment variables — never ship them to the browser.

```ts
import { AiRouter, writeNdjsonStream } from '@maxigarcia/ai-router';

const router = AiRouter({
  fallback: ['groq', 'open-router', 'gemini'],
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
    'gemini': {
      apiKey: process.env.GEMINI_API_KEY!,
      // optional — defaults to 'gemini-3.7-flash'
      model: 'gemini-3.7-flash',
    },
  },
});
```

Expose an endpoint that calls `router.create` and pipes the result through `writeNdjsonStream`. That NDJSON body is what `ai-client` expects:

```ts
// Example: Node / Edge-style handler sketch
export async function POST(request: Request) {
  const { messages } = await request.json();

  const stream = await router.create(messages);

  if (!Array.isArray(stream)) {
    const body = writeNdjsonStream(stream);

    return new Response(body, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
      },
    });
  } else {
    // handle the error
  }
}
```

**What the router does**

1. Tries providers in `fallback` order, rotated from the last successful provider when available
2. On failure, moves to the next provider
3. If every provider fails, rejects with an array of `AiRouterProviderError` (`{ providerName, error }`)
4. Trims conversation history to the model's context window before each call
5. Uses each provider's configured model (set on `providers[name].model`, not per request)

`writeNdjsonStream` encodes each chunk as one JSON line. If the provider stream throws mid-flight, it writes a final `{ "error": "<message>" }` line and closes — matching what `ai-client` reads.

More detail: [`packages/ai-router/README.md`](./packages/ai-router/README.md)

### 2. Client — `@maxigarcia/ai-client`

Install:

```bash
npm install @maxigarcia/ai-client
```

Call your endpoint from the browser (or any environment with `fetch`). The client POSTs `{ messages }` as JSON and yields OpenAI-style chat completion chunks from the NDJSON body:

```ts
import { AiClientError, streamChatCompletion } from '@maxigarcia/ai-client';

try {
  const stream = await streamChatCompletion('/api/chat', {
    messages: [{ role: 'user', content: 'Summarize this PR diff' }],
    model: 'unused-by-body-but-typed-for-openai-params',
    stream: true,
    // optional: auth or other request headers
    headers: {
      Authorization: `Bearer ${userToken}`,
    },
  });

  for await (const chunk of stream) {
    const text = chunk.choices[0]?.delta?.content;
    if (text) {
      // append to your UI
    }
  }
} catch (error) {
  if (error instanceof AiClientError) {
    console.error(error.message, error.status);
  }
  throw error;
}
```

`streamChatCompletion`:

- Sends a `POST` with `Content-Type: application/json` and body `{ messages }`
- Throws `AiClientError` on non-OK responses (uses `error` from JSON when present)
- Parses each NDJSON line as a chat completion chunk (or throws if a line contains `{ error }`)

## Development

This repo is an npm workspaces + Nx monorepo.

```bash
npm install
npm run build
npm test
npm run lint
```

Useful scripts:

| Script                      | Description                               |
| --------------------------- | ----------------------------------------- |
| `npm run build`             | Build all packages                        |
| `npm test`                  | Run Vitest                                |
| `npm run lint` / `lint:fix` | ESLint                                    |
| `npm run clean`             | Remove build artifacts and `node_modules` |
| `npm run phoenix`           | Clean, reinstall, and rebuild             |

## License

ISC © Maximiliano Garcia Mortigliengo

## Contributing

Issues and PRs are welcome: [github.com/MaxiGarcia13/ai](https://github.com/MaxiGarcia13/ai)
