/** Tab-scoped conversation state. Topic IDs are revalidated on the server. */
export const SESSION_KEY = "portfolio_assistant_session_v1";
export interface SessionMemory { version: 1; sourceIds: string[] }
export interface Citation { label: string; href: string; section: string; index?: number }
export interface SessionMessage {
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
  mode?: "llm" | "offline" | "guarded" | "refused" | "error" | "greeting" | "cancelled" | "source-unavailable" | "assistant-info" | "clarification";
  note?: string;
  suggestions?: string[];
  provider?: string;
  model?: string;
  actions?: { type: "credentials"; label: string; query: string }[];
}
const MODES = new Set(["llm", "offline", "guarded", "refused", "error", "greeting", "cancelled", "source-unavailable", "assistant-info", "clarification"]);
const safeHref = (href: string) => /^https:\/\/[^\s<>]+$/.test(href) || /^#[a-z0-9-]+$/i.test(href) || /^\/(?:credentials|internships)\/[a-z0-9._-]+$/i.test(href);
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);

export function readSession(raw: string | null): { messages: SessionMessage[]; memory: SessionMemory } | null {
  if (!raw || raw.length > 256_000) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (!record(value) || value.version !== 1 || !Array.isArray(value.messages)) return null;
    const messages = value.messages.slice(-32).flatMap((item): SessionMessage[] => {
      if (!record(item) || !["user", "assistant"].includes(String(item.role)) || typeof item.text !== "string") return [];
      const message: SessionMessage = { role: item.role as SessionMessage["role"], text: item.text.slice(0, 5000) };
      if (Array.isArray(item.citations)) message.citations = item.citations.slice(0, 12).flatMap((c): Citation[] => record(c) && typeof c.href === "string" && c.href.length <= 1000 && safeHref(c.href) && typeof c.label === "string" && typeof c.section === "string" ? [{ href: c.href, label: c.label.slice(0, 240), section: c.section.slice(0, 40), ...(Number.isInteger(c.index) && Number(c.index) > 0 ? { index: Number(c.index) } : {}) }] : []);
      if (typeof item.mode === "string" && MODES.has(item.mode)) message.mode = item.mode as SessionMessage["mode"];
      for (const key of ["note", "provider", "model"] as const) if (typeof item[key] === "string") message[key] = item[key].slice(0, 300);
      if (Array.isArray(item.suggestions)) message.suggestions = item.suggestions.filter((s): s is string => typeof s === "string" && s.length <= 600).slice(0, 4);
      if (Array.isArray(item.actions)) message.actions = item.actions.flatMap((a): NonNullable<SessionMessage["actions"]> => record(a) && a.type === "credentials" && typeof a.label === "string" && typeof a.query === "string" ? [{ type: "credentials", label: a.label.slice(0, 160), query: a.query.slice(0, 160) }] : []).slice(0, 2);
      return [message];
    });
    const memory: SessionMemory = { version: 1, sourceIds: record(value.memory) && value.memory.version === 1 && Array.isArray(value.memory.sourceIds) ? value.memory.sourceIds.filter((id): id is string => typeof id === "string" && id.length <= 160).slice(0, 8) : [] };
    return { messages, memory };
  } catch { return null; }
}

export function serializeSession(messages: SessionMessage[], memory: SessionMemory): string {
  const recent = messages.slice(-32);
  let raw = JSON.stringify({ version: 1, messages: recent, memory });
  while (raw.length > 240_000 && recent.length) {
    recent.shift();
    raw = JSON.stringify({ version: 1, messages: recent, memory });
  }
  return raw;
}

/** Leave room for the question and memory inside the API's request limit. */
export function requestHistory(messages: SessionMessage[]) {
  const selected: { role: SessionMessage["role"]; text: string; citations?: Citation[] }[] = [];
  for (const message of messages.filter(m => m.mode !== "error" && m.mode !== "cancelled").slice(-8).reverse()) {
    const next = { role: message.role, text: message.text.slice(0, 1200), citations: message.citations?.slice(0, 6) };
    if (new TextEncoder().encode(JSON.stringify([next, ...selected])).length > 18_000) break;
    selected.unshift(next);
  }
  return selected;
}
