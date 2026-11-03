import type { Chat, ChatMessage, ChatState, CreateChatOptions } from './types.js';
import { streamChatCompletion } from '../stream-chat-completion.js';
import { appendAssistantDelta } from './append-assistant-delta.js';
import { isAbortError } from './is-abort-error.js';

export function createChat(options: CreateChatOptions): Chat {
  let state: ChatState = {
    messages: options.initialMessages
      ? [...options.initialMessages]
      : [],
    loading: false,
    error: null,
  };
  const listeners = new Set<() => void>();
  let abortController: AbortController | null = null;

  function emit() {
    for (const listener of listeners) {
      listener();
    }
  }

  function setState(partial: Partial<ChatState>) {
    state = {
      ...state,
      ...partial,
    };
    emit();
  }

  function abortInFlight() {
    abortController?.abort();
    abortController = null;
  }

  async function send(content: string) {
    abortInFlight();

    const userMessage: ChatMessage = { role: 'user', content };
    const requestMessages = [...state.messages, userMessage];
    const assistantMessage: ChatMessage = { role: 'assistant', content: '' };

    abortController = new AbortController();
    const { signal } = abortController;

    setState({
      messages: [...requestMessages, assistantMessage],
      loading: true,
      error: null,
    });

    try {
      const stream = await streamChatCompletion(options.url, {
        body: {
          ...options.body,
          messages: requestMessages,
        },
        headers: options.headers,
        signal,
      });

      for await (const chunk of stream) {
        if (signal.aborted) {
          break;
        }

        const delta = chunk.choices[0]?.delta?.content;

        if (!delta) {
          continue;
        }

        const messages = appendAssistantDelta(state.messages, delta);

        if (!messages) {
          break;
        }

        setState({ messages });
      }

      if (abortController?.signal === signal) {
        setState({ loading: false });
      }
    } catch (error) {
      if (abortController?.signal !== signal) {
        return;
      }

      if (isAbortError(error) || signal.aborted) {
        setState({ loading: false });
        return;
      }

      setState({
        loading: false,
        error: error instanceof Error
          ? error
          : new Error(String(error)),
      });
    } finally {
      if (abortController?.signal === signal) {
        abortController = null;
      }
    }
  }

  return {
    getState() {
      return state;
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    send,
    stop() {
      abortInFlight();
      if (state.loading) {
        setState({ loading: false });
      }
    },
    setMessages(messages) {
      setState({
        messages: [...messages],
        error: null,
      });
    },
    reset() {
      abortInFlight();
      setState({
        messages: options.initialMessages
          ? [...options.initialMessages]
          : [],
        loading: false,
        error: null,
      });
    },
  };
}
