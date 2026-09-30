## 0.1.1 (2026-09-30)

### 🔄 Refactors

- Update AiRouter and types for improved structure and type safety ([871d70f](https://github.com/MaxiGarcia13/ai/commit/871d70f))

### 🧱 Updated Dependencies

- Updated @maxigarcia/ai-types to 0.0.7
- Updated @maxigarcia/ai-utils to 0.1.1

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.1.0 (2026-09-30)

### 🔄 Refactors

- Enhance error handling in AI router and client ([e618061](https://github.com/MaxiGarcia13/ai/commit/e618061))
- Replace AiRouterProviderError with AiError for improved error handling ([aed000e](https://github.com/MaxiGarcia13/ai/commit/aed000e))

### 🧪 Tests

- Add test for handling multiple provider errors in NDJSON stream ([feba98a](https://github.com/MaxiGarcia13/ai/commit/feba98a))

### 🧱 Updated Dependencies

- Updated @maxigarcia/ai-utils to 0.1.0

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.16 (2026-09-30)

### 🐞 Fixes

- Enhance error handling in POST request for NDJSON streaming ([3476b5e](https://github.com/MaxiGarcia13/ai/commit/3476b5e))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.15 (2026-09-30)

### 🐞 Fixes

- Update createAiRequest return type and adjust NDJSON stream tests ([c7ed2a6](https://github.com/MaxiGarcia13/ai/commit/c7ed2a6))

### 🔄 Refactors

- Update writeNdjsonStream function signature and README documentation ([c861419](https://github.com/MaxiGarcia13/ai/commit/c861419))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.14 (2026-09-30)

### 📚 Documentation

- Update README and ai-router documentation for NDJSON streaming ([59fe135](https://github.com/MaxiGarcia13/ai/commit/59fe135))

### 🧱 Updated Dependencies

- Updated @maxigarcia/ai-types to 0.0.6
- Updated @maxigarcia/ai-utils to 0.0.2

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.13 (2026-09-30)

### 🚀 Features

- Enhance createAiRequest with error handling and type updates ([1c53d7a](https://github.com/MaxiGarcia13/ai/commit/1c53d7a))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.12 (2026-09-30)

### 🚀 Features

- Update writeNdjsonStream to accept AsyncIterable of ChatCompletionChunk ([53e2b52](https://github.com/MaxiGarcia13/ai/commit/53e2b52))
- Enhance POST handler in README with NDJSON response example ([11df7c8](https://github.com/MaxiGarcia13/ai/commit/11df7c8))

### 🧪 Tests

- Update type assertions in NDJSON stream tests ([6022a7e](https://github.com/MaxiGarcia13/ai/commit/6022a7e))
- Add unit tests for NDJSON streaming functionality in ai-router ([ac834df](https://github.com/MaxiGarcia13/ai/commit/ac834df))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.11 (2026-09-30)

### 🚀 Features

- Update createAiRequest to include model in options ([c03a88e](https://github.com/MaxiGarcia13/ai/commit/c03a88e))

### 🐞 Fixes

- Make options parameter optional in createAiRequest function ([c3feab7](https://github.com/MaxiGarcia13/ai/commit/c3feab7))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.10 (2026-09-30)

### 🚀 Features

- Add README and implement NDJSON stream writing functionality ([5693d7a](https://github.com/MaxiGarcia13/ai/commit/5693d7a))
- Add trimMessagesForModel function for message context management ([9d0f592](https://github.com/MaxiGarcia13/ai/commit/9d0f592))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.9 (2026-09-29)

### 🚀 Features

- Integrate Vitest for testing across packages ([99fb8c5](https://github.com/MaxiGarcia13/ai/commit/99fb8c5))
- Introduce ai-utils package for shared AI utilities ([0a49f4c](https://github.com/MaxiGarcia13/ai/commit/0a49f4c))
- Enhance AI router with message trimming and model limits ([3923ec3](https://github.com/MaxiGarcia13/ai/commit/3923ec3))

### 🧱 Updated Dependencies

- Updated @maxigarcia/ai-types to 0.0.5
- Updated @maxigarcia/ai-utils to 0.0.1

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.8 (2026-09-29)

### 🧱 Updated Dependencies

- Updated @maxigarcia/ai-types to 0.0.4

## 0.0.7 (2026-09-29)

### 🔄 Refactors

- Update provider imports to use local types and add new types file for AiProviderConfig ([c520b17](https://github.com/MaxiGarcia13/ai/commit/c520b17))

### 🧱 Updated Dependencies

- Updated @maxigarcia/ai-types to 0.0.3

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.6 (2026-09-29)

### 🔄 Refactors

- Move AiRouterOptions type definition to a new file and update imports across the project ([8ffdaae](https://github.com/MaxiGarcia13/ai/commit/8ffdaae))

### 🧱 Updated Dependencies

- Updated @maxigarcia/ai-types to 0.0.2

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.5 (2026-09-29)

### 🚀 Features

- Introduce @maxigarcia/ai-types package for shared TypeScript types and update ai-router to utilize these types ([45d71b4](https://github.com/MaxiGarcia13/ai/commit/45d71b4))

### 🧱 Updated Dependencies

- Updated @maxigarcia/ai-types to 0.0.1

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.4 (2026-09-29)

### 🔄 Refactors

- Enhance type safety in AiRouterOptions and createAiRequest by introducing generics for fallback providers ([adcf6f8](https://github.com/MaxiGarcia13/ai/commit/adcf6f8))

### 🧪 Tests

- Add unit tests for AiRouter to validate completion handling and provider fallback logic ([aad1e92](https://github.com/MaxiGarcia13/ai/commit/aad1e92))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.3 (2026-09-29)

### 🔄 Refactors

- Rename providerConfig to providers and order to fallback in AiRouterOptions for clarity ([b569479](https://github.com/MaxiGarcia13/ai/commit/b569479))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.2 (2026-09-29)

### 🔄 Refactors

- Simplify provider order calculation in createAiRequest function ([3e36dba](https://github.com/MaxiGarcia13/ai/commit/3e36dba))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo

## 0.0.1 (2026-09-29)

### 🚀 Features

- Add Gemini provider to the AI router for enhanced functionality ([bcf058f](https://github.com/MaxiGarcia13/ai/commit/bcf058f))
- Add Gemini provider implementation and update types to include Gemini support ([cec4fe3](https://github.com/MaxiGarcia13/ai/commit/cec4fe3))
- Add uniqueProvider function to filter duplicate AI providers and integrate it into createAiRequest ([4109f29](https://github.com/MaxiGarcia13/ai/commit/4109f29))
- Add initial implementation of @maxigarcia/ai-router package with core functionality for managing AI provider interactions and configurations ([7841bd3](https://github.com/MaxiGarcia13/ai/commit/7841bd3))

### 🔄 Refactors

- Update AiRouterOptions interface to use Partial for providerConfig and adjust related test imports ([2199dfd](https://github.com/MaxiGarcia13/ai/commit/2199dfd))
- Rename AiClientOptions to AiRouterOptions and introduce AiRouter for improved request handling ([d3be3eb](https://github.com/MaxiGarcia13/ai/commit/d3be3eb))

### 📚 Documentation

- Update README.md for consistent quotation style and improve code example formatting ([7d58d3a](https://github.com/MaxiGarcia13/ai/commit/7d58d3a))
- Update README.md to reflect the renaming of AiClient to AiRouter and adjust usage examples accordingly ([157d1a9](https://github.com/MaxiGarcia13/ai/commit/157d1a9))
- Update README.md to include Gemini provider in routing options and enhance API key retrieval section ([5542d57](https://github.com/MaxiGarcia13/ai/commit/5542d57))
- Enhance README.md with additional usage details for AiClient, including options for create method ([7b96428](https://github.com/MaxiGarcia13/ai/commit/7b96428))
- Add README.md for @maxigarcia/ai-router with usage instructions, options, and behavior details ([eeb925c](https://github.com/MaxiGarcia13/ai/commit/eeb925c))

### 🧹 Chores

- Update package.json to include publishConfig, main, module, types, and files for better package management ([d462467](https://github.com/MaxiGarcia13/ai/commit/d462467))
- Update homepage URL in package.json to point to the README.md in the ai-router directory ([633fd3d](https://github.com/MaxiGarcia13/ai/commit/633fd3d))
- Update package.json files to reflect the new repository name "ai" and correct homepage and bug URLs ([10dd99a](https://github.com/MaxiGarcia13/ai/commit/10dd99a))
- Add test script to package.json and create vitest configuration for testing in the @maxigarcia/ai-router package ([8a595de](https://github.com/MaxiGarcia13/ai/commit/8a595de))
- Update package-lock.json and package.json to add 'vitest' as a devDependency for testing in the @maxigarcia/ai-router package ([9452929](https://github.com/MaxiGarcia13/ai/commit/9452929))

### 🧪 Tests

- Add comprehensive tests for AI client and provider functionalities, including balance provider order and error handling ([9a2426e](https://github.com/MaxiGarcia13/ai/commit/9a2426e))

### 🎨 Styles

- Format createAiRequest parameters for improved readability in AiRouter function ([559dec9](https://github.com/MaxiGarcia13/ai/commit/559dec9))

### ❤️ Thank You

- Maximiliano Garcia Mortigliengo