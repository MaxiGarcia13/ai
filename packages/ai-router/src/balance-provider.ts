import type { AiProviderName } from '@maxigarcia/ai-types';

export function balanceProvidersOrder(lastUsedProvider: AiProviderName | null, order: AiProviderName[]) {
  if (!lastUsedProvider) {
    return order;
  }

  const index = order.indexOf(lastUsedProvider);
  return [...order.slice(index), ...order.slice(0, index)];
}
