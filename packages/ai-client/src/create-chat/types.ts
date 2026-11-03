export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  error: Error | null;
}

export interface CreateChatOptions {
  url: string;
  headers?: Record<string, string>;
  initialMessages?: ChatMessage[];
  /** Extra fields merged into the request body alongside `messages`. */
  body?: Record<string, unknown>;
}

export interface Chat {
  getState: () => ChatState;
  subscribe: (listener: () => void) => () => void;
  send: (content: string) => Promise<void>;
  stop: () => void;
  setMessages: (messages: ChatMessage[]) => void;
  reset: () => void;
}
