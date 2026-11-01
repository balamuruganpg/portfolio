/** Tab-scoped conversation state. Topic IDs are revalidated on the server. */
export const SESSION_KEY = "portfolio_assistant_session_v1";
export const SESSION_EXCHANGES = 6;
export const MAX_CHAT_BYTES = 256_000;
export interface SessionMemory { version: 1; sourceIds: string[] }
export interface Citation { label: string; href: string; section: string; index?: number }
export interface SessionMessage {
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
  mode?: "llm" | "offline" | "guarded" | "refused" | "error" | "greeting" | "cancelled" | "source-unavailable" | "assistant-info" | "clarification" | "conversation";
  memory?: SessionMemory;
  note?: string;
  suggestions?: string[];
  provider?: string;
  model?: string;
  actions?: { type: "credentials"; label: string; query: string }[];
}
const MODES = new Set(["llm", "offline", "guarded", "refused", "error", "greeting", "cancelled", "source-unavailable", "assistant-info", "clarification", "conversation"]);
const safeHref = (href: string) => /^https:\/\/[^\s<>]+$/.test(href) || /^#[a-z0-9-]+$/i.test(href) || /^\/(?:credentials|internships)\/[a-z0-9._-]+$/i.test(href);
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);

/** Keep whole exchanges, including a pending user turn, with at most six of each role. */
export function trimExchanges<T extends { role: "user" | "assistant" }>(messages: T[]): { messages: T[]; droppedExchanges: number } {
  const starts = messages.flatMap((m, i) => m.role === "user" ? [i] : []);
  const droppedExchanges = Math.max(0, starts.length - SESSION_EXCHANGES);
  const recent = messages.slice(droppedExchanges ? starts[droppedExchanges] : 0);
  const counts = { user: 0, assistant: 0 };
  return { messages: recent.slice().reverse().filter(m => ++counts[m.role] <= SESSION_EXCHANGES).reverse(), droppedExchanges };
}

export function memoryFromMessages(messages: SessionMessage[]): SessionMemory {
  return [...trimExchanges(messages).messages].reverse().find(m => m.role === "assistant" && m.memory)?.memory ?? { version: 1, sourceIds: [] };
}

/** Source chips/actions are reserved for generated, source-checked portfolio facts. */
export function visibleCitations(message: Pick<SessionMessage, "mode" | "text" | "citations">): Citation[] {
  return message.mode === "llm" ? (message.citations ?? []).filter(c => c.index && message.text.includes(`[${c.index}]`)) : [];
}

function readMemory(value: unknown): SessionMemory {
  return { version: 1, sourceIds: record(value) && value.version === 1 && Array.isArray(value.sourceIds) ? value.sourceIds.filter((id): id is string => typeof id === "string" && id.length <= 160).slice(0, 8) : [] };
}

export function readSession(raw: string | null): { messages: SessionMessage[]; memory: SessionMemory; historyOffset: number } | null {
  if (!raw || raw.length > 256_000) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!record(value) || (value.version !== 1 && value.version !== 2) || !Array.isArray(value.messages)) return null;
    const messages = value.messages.flatMap((item): SessionMessage[] => {
      if (!record(item) || !["user", "assistant"].includes(String(item.role)) || typeof item.text !== "string") return [];
      const message: SessionMessage = { role: item.role as SessionMessage["role"], text: item.text.slice(0, 5000) };
      if (Array.isArray(item.citations)) message.citations = item.citations.slice(0, 12).flatMap((c): Citation[] => record(c) && typeof c.href === "string" && c.href.length <= 1000 && safeHref(c.href) && typeof c.label === "string" && typeof c.section === "string" ? [{ href: c.href, label: c.label.slice(0, 240), section: c.section.slice(0, 40), ...(Number.isInteger(c.index) && Number(c.index) > 0 ? { index: Number(c.index) } : {}) }] : []);
      if (typeof item.mode === "string" && MODES.has(item.mode)) message.mode = item.mode as SessionMessage["mode"];
      if (item.memory) message.memory = readMemory(item.memory);
      for (const key of ["note", "provider", "model"] as const) if (typeof item[key] === "string") message[key] = item[key].slice(0, 300);
      if (Array.isArray(item.suggestions)) message.suggestions = item.suggestions.filter((s): s is string => typeof s === "string" && s.length <= 600).slice(0, 4);
      if (Array.isArray(item.actions)) message.actions = item.actions.flatMap((a): NonNullable<SessionMessage["actions"]> => record(a) && a.type === "credentials" && typeof a.label === "string" && typeof a.query === "string" ? [{ type: "credentials", label: a.label.slice(0, 160), query: a.query.slice(0, 160) }] : []).slice(0, 2);
      return [message];
    });
    // Migrate the previous tab format without retaining its longer transcript.
    if (value.version === 1) {
      const last = [...messages].reverse().find(m => m.role === "assistant" && m.mode === "llm");
      if (last && !last.memory) last.memory = readMemory(value.memory);
    }
    const recent = trimExchanges(messages);
    const offset = Number.isSafeInteger(value.historyOffset) && Number(value.historyOffset) >= 0 ? Number(value.historyOffset) : 0;
    return { messages: recent.messages, memory: memoryFromMessages(recent.messages), historyOffset: offset + recent.droppedExchanges };
  } catch { return null; }
}

export function serializeSession(messages: SessionMessage[], _memory: SessionMemory, historyOffset = 0): string {
  const recent = trimExchanges(messages);
  return JSON.stringify({ version: 2, messages: recent.messages, historyOffset: historyOffset + recent.droppedExchanges });
}

/** Send all six exchanges. Do not silently drop messages to fit a smaller window. */
export function requestHistory(messages: SessionMessage[]) {
  return trimExchanges(messages).messages.map(message => ({ role: message.role, text: message.text.slice(0, message.role === "user" ? 600 : 5000), citations: visibleCitations(message).slice(0, 6) }));
}
