# @maxigarcia/ai-types

## What is it for?

Shared TypeScript types for `@maxigarcia/ai-router` and related packages — provider names, models, provider config, and router options.

## How to use it?

```ts
import type {
  AiProviderConfig,
  AiProviderModels,
  AiProviderName,
  AiRouterOptions,
} from '@maxigarcia/ai-types';
```

## Types

### `AiProviderName`

Union of supported provider identifiers:

```ts
type AiProviderName = 'groq' | 'open-router' | 'gemini';
```

### `AiProviderModels`

Default model per provider:

| Provider      | Default model         |
| ------------- | --------------------- |
| `groq`        | `openai/gpt-oss-120b` |
| `open-router` | `openrouter/free`     |
| `gemini`      | `gemini-3.7-flash`    |

### `AiProviderConfig`

Shape used by each provider adapter:

| Member             | Description                                           |
| ------------------ | ----------------------------------------------------- |
| `getClientOptions` | Builds OpenAI `ClientOptions` from a base URL         |
| `getCreateParams`  | Builds streaming chat-completion params for a request |

### `AiRouterOptions`

Options for configuring a multi-provider router:

| Option                   | Description                              |
| ------------------------ | ---------------------------------------- |
| `fallback`               | Provider fallback / rotation order       |
| `providers[name].apiKey` | Required API key for that provider       |
| `providers[name].model`  | Optional default model for that provider |
