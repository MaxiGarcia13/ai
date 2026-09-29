# @maxigarcia/ai-utils

## What is it for?

Shared utilities for AI message handling and context management, used by `@maxigarcia/ai-router` and related packages.

## How to use it?

```ts
import { trimMessagesToContext } from '@maxigarcia/ai-utils';
```

## Utilities

### `trimMessagesToContext`

Trims conversation messages so they fit within a model's context window, keeping the most recent messages and truncating when needed.
