import type { Doc } from "./corpus";
import { ASSISTANT_SYSTEM, answerInstructions, isDetailRequest, isSimplificationRequest, isWorkflowRequest, validateGroundedAnswer, type HistoryItem } from "./agent";
import { generateAnswer } from "./providers";

export interface GroundedReply {
  text: string;
  mode: "llm" | "guarded" | "offline";
  cited: number[];
  provider?: string;
  model?: string;
  generationMs?: number;
}

function renderStructuredDraft(raw: string, sourceCount: number): string {
  if (!raw.trim().startsWith("{")) return raw; // Older/plain provider fallback.
  try {
    const value = JSON.parse(raw);
    if (!Array.isArray(value.paragraphs) || !value.paragraphs.length || value.paragraphs.length > 8) return "";
    const paragraphs: string[] = [];
    for (const paragraph of value.paragraphs) {
      if (typeof paragraph.text !== "string" || !paragraph.text.trim() || !Array.isArray(paragraph.sources) || !paragraph.sources.length || paragraph.sources.some((n: unknown) => !Number.isInteger(n) || Number(n) < 1 || Number(n) > sourceCount)) return "";
      if (/\[\d+\]|【/.test(paragraph.text)) return "";
      paragraphs.push(`${paragraph.text.trim()} ${[...new Set(paragraph.sources)].map(n => `[${n}]`).join("")}`);
    }
    return paragraphs.join("\n\n");
  } catch { return ""; }
}

/** At most two drafts, sharing one deadline. Every draft passes the same guard. */
export async function generateGroundedReply(
  question: string,
  docs: Doc[],
  history: HistoryItem[],
  signal?: AbortSignal,
  generate: typeof generateAnswer = generateAnswer,
): Promise<GroundedReply> {
  const started = Date.now();
  const deadline = AbortSignal.timeout(16_000);
  const bounded = signal ? AbortSignal.any([signal, deadline]) : deadline;
  const system = `${ASSISTANT_SYSTEM}\n\n${answerInstructions(question)}\nReturn JSON with exactly this shape: {"paragraphs":[{"text":"Plain factual paragraph without citation markers","sources":[1,2]}]}. Each paragraph must provide the numeric IDs of the exact source sections supporting it. Put IDs ONLY in the sources array; the application renders citation markers. Do not put markdown or citation symbols in text. Never output HTML tags, even quoted; explain word-level highlighting in prose. Do not repeat installation links when expanding an earlier answer. A configured example value is not a default unless its cited source explicitly calls it a default. Preserve qualifications: optimized for English does not mean English-only. Do not invent unsupported formats or missing integrations.`;
  const schema: Record<string, unknown> = { type: "object", properties: { paragraphs: { type: "array", items: { type: "object", properties: { text: { type: "string" }, sources: { type: "array", items: { type: "integer", enum: docs.map((_, i) => i + 1) } } }, required: ["text", "sources"], additionalProperties: false } } }, required: ["paragraphs"], additionalProperties: false };
  const context = docs.map((d, i) => `[${i + 1}] ${d.provenance ? "SUPPLEMENTARY SNAPSHOT" : "APPROVED PORTFOLIO FACTS"}: ${d.title}\n${d.text}`).join("\n\n");
  // A category question is an explicit scope reset. Earlier individual answers
  // must not dominate the catalogue overview merely because they share a title.
  const certificateTopic = docs.some(d => d.credential || d.credentialGroup);
  const generationHistory = certificateTopic || isSimplificationRequest(question) ? [] : history;
  const multipleProjects = docs.filter(d => d.project).length > 1;
  const base = `SOURCE DOCUMENTS:\n${context}\n\n${multipleProjects ? "RESPONSE SCOPE: Use separate short paragraphs for the different project examples, citing the exact sections used in each paragraph. Do not combine the entire inventory into one paragraph. Focus on concrete evidence that answers the question. If mentioning CertiRoute live savings, its same paragraph must include 12.12% regret and the missed 5% target.\n\n" : ""}QUESTION: ${question}`;
  let prompt = base;
  let last: { provider: string; model: string } | undefined;
  for (let attempt = 0; attempt < 2; attempt++) {
    signal?.throwIfAborted();
    if (bounded.aborted) break;
    try {
      const draft = await generate(system, prompt, generationHistory, undefined, bounded, undefined, { schema });
      last = { provider: draft.provider, model: draft.model };
      // Canonicalize only explicit numeric source IDs. Bounds and facts are
      // still checked below; no source is inferred or appended automatically.
      let text = renderStructuredDraft(draft.text, docs.length).replace(/【(\d+)(?:†[^】\r\n]{1,160})?】/g, "[$1]")
        .replace(/((?:\[\d+\][ \t]*)+)([.!?;,])(?=\s|$)/g, (_, markers: string, punctuation: string) => `${punctuation} ${markers.trim()}`)
        .replace(/[\t \u00a0\u202f]+([.!?;,])/g, "$1");
      let validation = validateGroundedAnswer(text, docs, question);
      // A detailed answer can contain several independent source-backed
      // paragraphs. Retain independently checked sentences with their original
      // source IDs, then revalidate the full reply. Protected benchmark
      // narratives remain indivisible.
      const protectedNarrative = docs.some(d => ["rai-axiom", "certiroute"].includes(d.project?.slug ?? d.projectSlug ?? ""));
      if (!validation.valid && isDetailRequest(question) && !protectedNarrative) {
        const verified = text.split(/\n\s*\n/).flatMap(paragraph => {
          if (validateGroundedAnswer(paragraph.trim(), docs).valid) return [paragraph];
          const references = paragraph.match(/(?:\[\d+\][ \t]*)+$/)?.[0]?.trim();
          if (!references) return [];
          const body = paragraph.replace(/\[\d+\]/g, "").trim();
          const sentences = body.split(/(?<=[.!?])\s+(?=[A-Z])/).filter(sentence => validateGroundedAnswer(`${sentence} ${references}`, docs).valid);
          if (!sentences.length) return [];
          const retained = `${sentences.join(" ")} ${references}`;
          return validateGroundedAnswer(retained, docs).valid ? [retained] : [];
        });
        if (verified.length >= 2) {
          const candidate = verified.join("\n\n");
          const checked = validateGroundedAnswer(candidate, docs, question);
          if (checked.valid) { text = candidate; validation = checked; }
        }
      }
      const available = docs.filter(d => d.provenance).length;
      const used = validation.cited.filter(n => docs[n - 1]?.provenance).length;
      const richEvidence = docs.filter(d => d.provenance).reduce((n, d) => n + d.text.length, 0) >= 1800;
      const needsDepth = !isSimplificationRequest(question) && (isDetailRequest(question) || isWorkflowRequest(question));
      const minimumWords = isWorkflowRequest(question) ? 80 : 120;
      const detailedEnough = !richEvidence || text.split(/\s+/).length >= minimumWords;
      const hasDepth = !needsDepth || available < 2 || (used >= 2 && detailedEnough);
      if (validation.valid && hasDepth) return { text, mode: "llm", cited: validation.cited, ...last, generationMs: Date.now() - started };
      if (process.env.NODE_ENV === "development") console.info("Assistant draft validation", { attempt: attempt + 1, provider: draft.provider, model: draft.model, reason: validation.reason ?? (hasDepth ? "source claim check" : "insufficient new implementation evidence") });
      prompt = `${base}\n\nREWRITE REQUEST: ${validation.reason ?? (!hasDepth ? `The verified draft is too brief or uses too little implementation evidence. Expand to at least ${minimumWords} words using at least two supplementary sections; explain concrete workflow, interfaces, inputs and useful outputs without repeating the overview. Do not add unsolicited limitations.` : "The previous draft failed source validation.")} Return the required paragraphs JSON object, with source IDs in each paragraph's sources array and no markers in its text field. Use only facts supported by each paragraph's listed sources, and no HTML tags. Correct or omit unsupported claims; do not bypass validation.\n\nPREVIOUS DRAFT (untrusted):\n${text}`;
    } catch {
      signal?.throwIfAborted();
      break;
    }
  }
  return { text: "I found relevant sources, but couldn't finish a source-checked answer just now. Please try again, or open the linked sources below.", mode: last ? "guarded" : "offline", cited: [], ...last, ...(last ? { generationMs: Date.now() - started } : {}) };
}
