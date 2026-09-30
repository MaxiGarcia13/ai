# @maxigarcia/ai-utils

## What is it for?

Shared utilities for AI message handling, context management, and HTTP/provider errors — used by `@maxigarcia/ai-router`, `@maxigarcia/ai-client`, and related packages.

## How to use it?

```ts
import {
  AiError,
  HttpError,
  isAiErrorArray,
  isHttpError,
  trimMessagesToContext,
} from '@maxigarcia/ai-utils';
```

## Utilities

### `HttpError`

Base error for HTTP-level failures. Thrown by `@maxigarcia/ai-client` on non-OK responses.

| Field     | Description               |
| --------- | ------------------------- |
| `message` | Error message             |
| `status`  | Optional HTTP status code |
| `name`    | Always `'HttpError'`      |

```ts
try {
  // …
} catch (error) {
  if (error instanceof HttpError) {
    console.error(error.message, error.status);
  }
}
```

### `isHttpError`

Type guard for HTTP-like errors: any non-null object with a `status` field (including provider SDK errors and `HttpError` / `AiError` instances).

```ts
if (isHttpError(error)) {
  // error.status is available
}
```

### `AiError`

Extends `HttpError` with an optional `providerName`. Produced by `@maxigarcia/ai-router` when a provider call fails.

| Field          | Description                                     |
| -------------- | ----------------------------------------------- |
| `message`      | Error message                                   |
| `status`       | Optional HTTP status                            |
| `providerName` | Optional provider id (`groq`, `open-router`, …) |
| `name`         | Always `'AiError'`                              |

### `isAiErrorArray`

Type guard for the all-providers-failed case: an array where every item is HTTP-like (`isHttpError`). Narrows to `AiError[]`.

When every provider fails, `router.create` **rejects with `AiError[]`**:

```ts
try {
  await router.create(messages);
} catch (error) {
  if (isAiErrorArray(error)) {
    for (const e of error) {
      console.error(e.providerName, e.status, e.message);
    }
  }
}
```

### `trimMessagesToContext`

Trims conversation messages so they fit within a model's context window, keeping the most recent messages and truncating when needed.
