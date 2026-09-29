# @maxigarcia/ai-types

## What is it for?

Shared TypeScript types for AI provider names and their default models, used by `@maxigarcia/ai-router` and related packages.

## How to use it?

```ts
import type { AiProviderModels, AiProviderName } from '@maxigarcia/ai-types';
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
