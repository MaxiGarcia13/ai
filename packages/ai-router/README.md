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
import { isAiErrorArray } from '@maxigarcia/ai-utils';

// set up once on the server
const router = AiRouter({
  fallback: ['groq', 'open-router'],
  providers: {
    'groq': {
      apiKey: process.env.GROQ_API_KEY!,
      // optional — defaults to 'openai/gpt-oss-120b'
      model: 'openai/gpt-oss-120b',
      temperature: 0.2,
      max_tokens: 1024,
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

  try {
    const stream = await router.create(messages);
    const body = writeNdjsonStream(stream);

    return new Response(body, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    // Every provider failed — rejection value is AiError[]
    if (isAiErrorArray(error)) {
      return Response.json(
        {
          error: 'All providers failed',
          providers: error.map((e) => ({
            providerName: e.providerName,
            status: e.status,
            message: e.message,
          })),
        },
        { status: 502 },
      );
    }

    throw error;
  }
}
```

### `AiRouter` options

| Option                   | Description                                                             |
| ------------------------ | ----------------------------------------------------------------------- |
| `fallback`               | Provider fallback / rotation order                                      |
| `providers[name].apiKey` | Required API key for that provider                                      |
| `providers[name].model`  | Optional model for that provider                                        |
| `providers[name].*`      | Optional OpenAI chat completion params (`temperature`, `max_tokens`, …) |

Per-provider extras accept OpenAI chat completion fields except `messages`, `model`, `stream`, `tools`, `tool_choice`, and `parallel_tool_calls` (for example `temperature`, `max_tokens`). Pass tools per `create` call instead.

### `router.create(messages, options?)`

Default (`stream: true` / omitted): resolves to an `AsyncIterable` of chat completion chunks for `writeNdjsonStream` / the browser client.

With `{ stream: false }`: resolves to a full `ChatCompletion` (including `choices[0].message.tool_calls`) for agent / tool rounds.

| Call option            | Description                                      |
| ---------------------- | ------------------------------------------------ |
| `stream`               | Default `true`. Use `false` for tool rounds      |
| `tools`                | OpenAI tool definitions for this request         |
| `tool_choice`          | OpenAI `tool_choice` for this request            |
| `parallel_tool_calls`  | Optional parallel tool-call flag                 |

Model and tuning options still come from each provider's config. On total failure, **rejects with `AiError[]`** (see [Errors](#errors)).

#### Tool rounds then stream the answer

Keep tools off the final UI stream. Run silent non-stream rounds, execute tools in your app, then stream once:

```ts
const conversation = [...messages];

for (let i = 0; i < maxToolRounds; i++) {
  const completion = await router.create(conversation, {
    stream: false,
    tools,
    tool_choice: 'auto',
  });
  const message = completion.choices[0]?.message;
  if (!message?.tool_calls?.length) break;

  conversation.push(message);
  for (const call of message.tool_calls) {
    conversation.push({
      role: 'tool',
      tool_call_id: call.id,
      content: await runTool(call), // app / MCP — not the router
    });
  }
}

const stream = await router.create(conversation);
return new Response(writeNdjsonStream(stream), {
  headers: {
    'Content-Type': 'application/x-ndjson',
    'Cache-Control': 'no-cache',
  },
});
```

### `writeNdjsonStream(stream)`

Encodes an async iterable of chat completion chunks as NDJSON. Returns a `BodyInit` suitable for `new Response(body)`.

- Each chunk is written as one JSON line
- If the iterable throws, writes a final `{ "error": "<message>" }` line and closes

Pair this with `@maxigarcia/ai-client`'s `readNdjsonStream` / `streamChatCompletion` on the client.

### Behavior

1. Tries providers in `fallback` (rotated from the last successful one when available).
2. On HTTP-style failures (`isHttpError`), wraps each as `AiError` and moves to the next provider.
3. If every provider fails, rejects with `AiError[]`.
4. Trims conversation history to the model's context window before each call.

### Errors

Provider SDK errors that look like HTTP failures (`isHttpError` — objects with a `status` field) are collected as `AiError` from `@maxigarcia/ai-utils`:

| Field          | Description                                      |
| -------------- | ------------------------------------------------ |
| `message`      | Error message from the provider                  |
| `status`       | Optional HTTP status (e.g. `429`, `500`)         |
| `providerName` | Which provider failed (`groq`, `open-router`, …) |

When **all** providers fail, `router.create` rejects with that array:

```ts
try {
  const stream = await router.create(messages);
  // stream success…
} catch (error) {
  if (isAiErrorArray(error)) {
    // e.g. error[0].providerName, error[0].status, error[0].message
  }
}
```

Use the first error’s `status` (or `502`) for your HTTP response, and optionally expose the full list for debugging. Non-HTTP failures (missing API key, unknown provider) still throw a normal `Error`.
