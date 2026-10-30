/** One turn as sent to the API. */
export type ChatTurn = { role: 'user' | 'assistant'; text: string };

/** One bubble on screen. */
export type ChatMessage = ChatTurn & {
  id: string;
  hadPhoto?: boolean;
  seeProfessional?: boolean;
};

/** Server accepts at most 12 turns of ≤1000 chars, ending with the user. */
export const MAX_TURNS = 12;
export const MAX_TURN_CHARS = 1000;

/**
 * Most recent turns that fit the API contract: oldest dropped first, must
 * start with a user turn (assistant-first context confuses the model).
 */
export function toApiTurns(messages: readonly ChatMessage[]): ChatTurn[] {
  const turns = messages
    .slice(-MAX_TURNS)
    .map(({ role, text }) => ({ role, text: text.trim().slice(0, MAX_TURN_CHARS) }))
    .filter((turn) => turn.text.length > 0);
  while (turns.length > 0 && turns[0]!.role !== 'user') {
    turns.shift();
  }
  return turns;
}
