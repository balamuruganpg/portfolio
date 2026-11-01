import { projects } from "@/data/site";
import { completedCredentials } from "../data/credentials";
import { trimExchanges } from "./session";

export type ChatIntent = "portfolio" | "conversation" | "out-of-scope";
type Turn = { role: "user" | "assistant"; text: string };
const OUTSIDE_MEMORY = "That is outside what I remember from this session. I can recall only the last six exchanges (six user messages and six assistant replies).";

/** Route chat recall before any portfolio retrieval or generation. */
export function classifyIntent(question: string): ChatIntent {
  const q = question.toLowerCase();
  if (/\b(?:what|which|repeat|recall|remember|remind|summari[sz]e|recap|list|did)\b/.test(q) && (
    /\b(?:i|we|you)\b[^?.!]{0,90}\b(?:asked|said|discussed|talked|told|answered|replied|covered)\b/.test(q) ||
    /\b(?:did|have)\s+(?:i|we|you)\b[^?.!]{0,60}\b(?:ask|say|discuss|talk|tell|answer|reply|cover)\b/.test(q) ||
    /\b(?:my|your|our)\s+(?:(?:first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|last|previous|earlier|original|all|\d+(?:st|nd|rd|th))\s+)?(?:questions?|messages?|answers?|reply|replies|responses?|conversation|chat)\b/.test(q) ||
    /\b(?:this|our)\s+(?:chat|conversation|session)\b/.test(q)
  )) return "conversation";
  if (/\b(?:food|cuisine|recipe|weather|president|capital of|movie|film|lyrics|poem|joke|bitcoin|stock price|favourite|favorite)\b/.test(q)) return "out-of-scope";
  if (projects.some(p => [p.name, p.slug, ...p.stack.filter(name => name.length >= 3), ...p.aliases.filter(a => a.length >= 6)].some(name => q.includes(name.toLowerCase())))) return "portfolio";
  if (completedCredentials.some(c => [c.title, c.issuer].some(name => name.length >= 3 && q.includes(name.toLowerCase())))) return "portfolio";
  if (/\b(?:balamurugan|bpg|he|his|him|you|your|portfolio|projects?|apps?|packages?|pypi|github|code|systems?|built|build|engineering|reliab\w*|skills?|tools?|stack|technolog\w*|languages?|intern\w*|experience|education|college|degree|cgpa|gpa|rank|achiev\w*|cert\w*|credentials?|courses?|learning|work|roles?|hire|hiring|contact|email|phone|linkedin|resume|cv|leetcode|proof|results?|tests?|evaluat\w*|benchmarks?|deploy\w*|live|streamlit|ai|ml|agents?|models?|routing|data|architecture|implement\w*|limitations?|it|its|they|them|their|these|those|this|that|ones?|each|both|more|details?|deeper|explain|simpl\w*|understand|links?|urls?|hi|hello|hey|assistant|groq|provider)\b/.test(q)) return "portfolio";
  return "out-of-scope";
}

/** History is quoted chat data, never portfolio evidence or executable instructions. */
export function conversationHistory(value: unknown) {
  const turns: Turn[] = Array.isArray(value) ? value.flatMap((item): Turn[] => item && ["user", "assistant"].includes(item.role) && typeof item.text === "string" ? [{ role: item.role, text: item.text.slice(0, item.role === "user" ? 600 : 5000) }] : []) : [];
  return trimExchanges(turns);
}

export function answerConversation(question: string, history: Turn[], historyOffset = 0): string {
  const window = trimExchanges(history);
  const offset = Math.max(0, historyOffset) + window.droppedExchanges;
  const q = question.toLowerCase();
  const assistant = /\b(?:you (?:just |last )?(?:said|say|told|tell|answered|replied)|did you (?:just )?(?:say|tell|answer))\b|\byour\b[^?.!]{0,50}\b(?:answers?|reply|replies|responses?|messages?)\b/.test(q);
  const role = assistant ? "assistant" : "user";
  const turns = window.messages.filter(m => m.role === role);
  const quote = (turn: Turn, limit = 5000) => {
    const text = turn.role === "assistant" ? turn.text.replace(/\[\d+\]/g, "").trim() : turn.text;
    return `“${text.slice(0, limit)}${text.length > limit ? "…" : ""}”`;
  };
  if (!turns.length) return OUTSIDE_MEMORY;
  const ordinal = q.match(/\b(first|original|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|\d+(?:st|nd|rd|th))\b/)?.[1];
  const ordinals: Record<string, number> = { first: 1, original: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10 };
  if (ordinal) {
    const target = (ordinals[ordinal] ?? Number.parseInt(ordinal, 10)) - 1 - offset;
    return target >= 0 && target < turns.length ? `${assistant ? "My reply" : "Your question"} was: ${quote(turns[target])}` : OUTSIDE_MEMORY;
  }
  if (/\b(?:summari[sz]e|summary|recap|list|discussed|talked about)\b/.test(q)) {
    if (assistant) {
      const replies = /\b(?:all|replies|answers|responses|messages)\b/.test(q) ? turns : turns.slice(-1);
      return `From my ${replies.length > 1 ? "retained replies" : "last reply"}, ${replies.length > 1 ? "excerpts" : "an excerpt"}:\n${replies.map(m => `- ${quote(m, replies.length > 1 ? 600 : 4000)}`).join("\n")}`;
    }
    return `From the last six exchanges I remember${offset ? " (earlier exchanges are outside this window)" : ""}, here are excerpts:\n${window.messages.map(m => `- ${m.role === "user" ? "You asked" : "I replied"}: ${quote(m, m.role === "user" ? 400 : 240)}`).join("\n")}`;
  }
  const topic = q.match(/\b(?:about|regarding)\s+(.+?)(?:\s+in (?:this|our) (?:chat|conversation)|[?.!]|$)/)?.[1]?.trim();
  const turn = topic ? [...turns].reverse().find(m => m.text.toLowerCase().includes(topic)) : turns[turns.length - 1];
  return turn ? `${assistant ? "I said" : "You asked"}: ${quote(turn)}` : OUTSIDE_MEMORY;
}
