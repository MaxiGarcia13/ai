# @maxigarcia/ai-router

## What is it for?

Routes chat completion requests across multiple AI providers (`groq`, `open-router`).

If one provider fails, the next in your `order` list is tried automatically. After a successful request, the next call starts from the last used provider so traffic is balanced across them.

## Where to use it?

Use it on the **server** — API routes, backend services, or any server-side code that holds provider API keys. Do not use it in the browser; keys must stay private.

## How to use it?

```ts
import { AiClient } from "@maxigarcia/ai-router";

// set up once on the server
const client = await AiClient({
  order: ["groq", "open-router"],
  providerConfig: {
    groq: {
      apiKey: process.env.GROQ_API_KEY!,
      // optional — defaults to 'openai/gpt-oss-120b'
      model: "openai/gpt-oss-120b",
    },
    "open-router": {
      apiKey: process.env.OPENROUTER_API_KEY!,
      // optional — defaults to 'openrouter/free'
      model: "openrouter/free",
    },
  },
});

// call from your endpoint handler
const messages = [{ role: "user" as const, content: "Summarize this PR diff" }];

const stream = await client.create(messages);

for await (const chunk of stream) {
  const text = chunk.choices[0]?.delta?.content;
  if (text) process.stdout.write(text);
}
```

### `AiClient` options

| Option                        | Description                              |
| ----------------------------- | ---------------------------------------- |
| `order`                       | Provider fallback / rotation order       |
| `providerConfig[name].apiKey` | Required API key for that provider       |
| `providerConfig[name].model`  | Optional default model for that provider |

### `client.create(messages, options?)`

| Option        | Description                                              |
| ------------- | -------------------------------------------------------- |
| `messages`    | Chat messages (first argument)                           |
| `model`       | Model for this request (falls back to provider default)  |
| `stream`      | Stream the response — defaults to `true`                 |
| `temperature` | Sampling temperature                                     |
| `max_tokens`  | Maximum tokens to generate                               |
| `tools`       | Tool / function definitions                              |

### Behavior

1. Tries providers in `order` (rotated from the last successful one when available).
2. On failure, moves to the next provider.
3. If every provider fails, rejects with an array of `{ providerName, error }`.
