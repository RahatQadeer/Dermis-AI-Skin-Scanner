import { useCallback, useRef, useState } from 'react';

import { getCopy } from '@/src/copy';
import { isApiError } from '@/src/lib/api/errors';

import { sendAssistantMessage } from '../api/assistantApi';
import { assistantErrorKey } from '../lib/assistantErrors';
import { toApiTurns, type ChatMessage } from '../lib/chatHistory';

type Photo = { base64: string; contentType: 'image/jpeg' };

/**
 * Conversation state for the assistant. Held in memory only: nothing is
 * persisted, and it unmounts with the screen (so it never survives sign-out).
 */
export function useAssistantChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [proRequired, setProRequired] = useState(false);

  const send = useSend({
    state: { messages, draft, photo, sending },
    set: { setMessages, setDraft, setPhoto, setSending, setError, setRemaining, setProRequired },
  });

  return {
    messages,
    draft,
    setDraft,
    photo,
    setPhoto,
    sending,
    error,
    setError,
    dismissError: () => setError(null),
    remaining,
    proRequired,
    send,
  };
}

type SendDeps = {
  state: { messages: ChatMessage[]; draft: string; photo: Photo | null; sending: boolean };
  set: {
    setMessages: (fn: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
    setDraft: (v: string) => void;
    setPhoto: (p: Photo | null) => void;
    setSending: (v: boolean) => void;
    setError: (v: string | null) => void;
    setRemaining: (n: number) => void;
    setProRequired: (v: boolean) => void;
  };
};

function useSend({ state, set }: SendDeps) {
  const a = getCopy().screens.assistant;
  const nextId = useRef(0);
  return useCallback(
    async (text?: string) => {
      const body = (text ?? state.draft).trim();
      if (!body || state.sending) {
        return;
      }
      const userMsg: ChatMessage = {
        id: `m${String(nextId.current++)}`,
        role: 'user',
        text: body,
        hadPhoto: Boolean(state.photo),
      };
      const history = [...state.messages, userMsg];
      set.setMessages(history);
      set.setDraft('');
      set.setError(null);
      set.setSending(true);
      try {
        const res = await sendAssistantMessage({
          messages: toApiTurns(history),
          ...(state.photo ? { image: state.photo } : {}),
        });
        set.setPhoto(null);
        set.setRemaining(res.remainingToday);
        const reply: ChatMessage = {
          id: `m${String(nextId.current++)}`,
          role: 'assistant',
          text: res.reply,
          seeProfessional: res.seeProfessional,
        };
        set.setMessages((prev) => [...prev, reply]);
      } catch (err: unknown) {
        set.setProRequired(isApiError(err) && err.code === 'pro_required');
        set.setError(a[assistantErrorKey(err)] as string);
        // Put the failed message back in the box so the user can resend it.
        set.setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
        set.setDraft(body);
      } finally {
        set.setSending(false);
      }
    },
    [a, set, state],
  );
}
