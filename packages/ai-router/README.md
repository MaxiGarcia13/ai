# @maxigarcia/ai-router

## What is it for?

Routes chat completion requests across multiple AI providers (`gemini`, `groq`, `open-router`).

If one provider fails, the next in your `fallback` list is tried automatically. After a successful request, the next call starts from the last used provider so traffic is balanced across them.

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
import { AiRouter } from '@maxigarcia/ai-router';

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

| Option                   | Description                              |
| ------------------------ | ---------------------------------------- |
| `fallback`               | Provider fallback / rotation order       |
| `providers[name].apiKey` | Required API key for that provider       |
| `providers[name].model`  | Optional default model for that provider |

### `client.create(messages, options?)`

| Option        | Description                                             |
| ------------- | ------------------------------------------------------- |
| `messages`    | Chat messages (first argument)                          |
| `model`       | Model for this request (falls back to provider default) |
| `stream`      | Stream the response — defaults to `true`                |
| `temperature` | Sampling temperature                                    |
| `max_tokens`  | Maximum tokens to generate                              |
| `tools`       | Tool / function definitions                             |

### Behavior

1. Tries providers in `fallback` (rotated from the last successful one when available).
2. On failure, moves to the next provider.
3. If every provider fails, rejects with an array of `{ providerName, error }`.
