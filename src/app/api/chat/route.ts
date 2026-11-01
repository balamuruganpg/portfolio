import { NextResponse } from "next/server";
import { buildSiteDocs } from "@/lib/corpus";
import { generateGroundedReply } from "@/lib/answer";
import { followUpSuggestions, isLinkRequest, memoryFor, sanitizeHistory, sanitizeMemory } from "@/lib/agent";
import { assistantInformation, providerStatus } from "@/lib/providers";
import { citationsFor } from "@/lib/retrieve";
import { evidenceDocs, retrieveEvidence } from "@/lib/rag/search";
import { isBlockedQuestion } from "@/lib/rag/core";
import { knowledgeStatus, loadRagEvidence } from "@/lib/rag/server";
import { planQuestion, shouldPlanQuestion } from "@/lib/rag/planning";
import { answerConversation, classifyIntent, conversationHistory } from "@/lib/conversation";
import { MAX_CHAT_BYTES } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const REFUSAL = "I only answer questions about Balamurugan's portfolio: his projects, skills, internships, education, achievements, certifications and how to contact him. Try one of the suggested questions.";
const headers = { "Cache-Control": "no-store" };
// Fixed windows bound memory and return an actionable Retry-After.
const visits = new Map<string, { count: number; expires: number }>();
function retryAfter(ip: string): number {
  const now = Date.now();
  for (const [key, value] of visits) if (value.expires <= now) visits.delete(key);
  if (visits.size >= 1000 && !visits.has(ip)) return 60;
  const entry = visits.get(ip) ?? { count: 0, expires: now + 60_000 };
  entry.count++;
  visits.set(ip, entry);
  return entry.count > 20 ? Math.ceil((entry.expires - now) / 1000) : 0;
}

export async function GET() { return NextResponse.json({ ...providerStatus(), knowledge: knowledgeStatus(await loadRagEvidence()) }, { headers }); }
export async function POST(req: Request) {
  if (!(req.headers.get("content-type") ?? "").includes("application/json")) return NextResponse.json({ error: "Send a JSON question." }, { status: 415, headers });
  const length = Number(req.headers.get("content-length") ?? 0);
  if (length > MAX_CHAT_BYTES) return NextResponse.json({ error: "Message is too large." }, { status: 413, headers });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 100) || "local";
  const wait = retryAfter(ip);
  if (wait) return NextResponse.json({ error: `Please wait ${wait} seconds before asking again.` }, { status: 429, headers: { ...headers, "Retry-After": String(wait) } });
  let body;
  try {
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > MAX_CHAT_BYTES) return NextResponse.json({ error: "Message is too large." }, { status: 413, headers });
    body = JSON.parse(raw);
  } catch { return NextResponse.json({ error: "Send a valid JSON question." }, { status: 400, headers }); }
  if (!body || typeof body !== "object" || typeof body.question !== "string" || !body.question.trim()) return NextResponse.json({ error: "Please enter a question." }, { status: 400, headers });
  const question = body.question.trim();
  if (question.length > 600) return NextResponse.json({ error: "Keep your question under 600 characters." }, { status: 400, headers });
  if (isBlockedQuestion(question)) return NextResponse.json({ answer: "I can help with documented portfolio facts, but cannot reveal private configuration, follow override instructions or fetch visitor-supplied URLs.", citations: [], mode: "refused" }, { headers });
  const intent = classifyIntent(question);
  if (intent === "conversation") {
    const history = conversationHistory(body.history);
    const offset = Number.isSafeInteger(body.historyOffset) && body.historyOffset >= 0 ? body.historyOffset : 0;
    return NextResponse.json({ answer: answerConversation(question, history.messages, offset + history.droppedExchanges), mode: "conversation", citations: [], actions: [], suggestions: [] }, { headers });
  }
  if (intent === "out-of-scope") return NextResponse.json({ answer: REFUSAL, citations: [], mode: "refused", suggestions: ["What is VeraScan?", "Which projects are live?"] }, { headers });
  const information = assistantInformation(question);
  if (information) return NextResponse.json({ answer: information, citations: [], mode: "assistant-info", suggestions: ["What is VeraScan?", "Which projects are live?", "What are his achievements?"] }, { headers });

  const approved = buildSiteDocs();
  const evidence = await loadRagEvidence();
  const corpus = [...approved, ...evidenceDocs(evidence.chunks, approved)];
  const history = sanitizeHistory(body.history, corpus);
  const memory = sanitizeMemory(body.memory, approved);
  if (/linkedin/i.test(question) && !evidence.sources.some(s => s.kind === "linkedin" && s.status === "indexed")) {
    const contact = approved.find(d => d.id === "contact")!;
    return NextResponse.json({ answer: "Balamurugan’s LinkedIn profile is https://www.linkedin.com/in/balamuruganpg. Its profile content is not indexed because LinkedIn blocked public access. I can answer from his approved portfolio and resume instead.", citations: [], memory: memoryFor([contact]), mode: "source-unavailable", suggestions: ["What are his skills?", "What are his achievements?"] }, { headers });
  }
  if (/^(hi|hello|hey|good (morning|evening|afternoon))[!.\s]*$/i.test(question)) return NextResponse.json({ answer: "Hi! I can help you explore Balamurugan's projects, verified results and experience. What would you like to know?", citations: [], mode: "greeting", suggestions: ["What is VeraScan?", "What are his achievements?", "Is he open to roles?"] }, { headers });
  let result = retrieveEvidence(question, approved, evidence.chunks, history, 12_000, undefined, memory);
  if (result.needsClarification) return NextResponse.json({ answer: isLinkRequest(question) ? "Which project or topic would you like links for?" : "Which project or topic would you like me to explain more simply?", citations: [], mode: "clarification", suggestions: ["Which projects are live?", "What is VeraScan?", "How can I contact him?"] }, { headers });
  let strategy = result.aliasHit ? "direct" : "lexical";
  if (shouldPlanQuestion(question, result)) {
    const plan = await planQuestion(question, approved, history, req.signal);
    if (plan) {
      result = retrieveEvidence(question, approved, evidence.chunks, history, 12_000, plan, memory);
      strategy = "semantic";
    }
  }
  if (!result.docs.length) return NextResponse.json({ answer: REFUSAL, citations: [], mode: "refused", suggestions: ["What is VeraScan?", "Which projects are live?"] }, { headers });
  const docs = result.docs;
  const credentialGroup = docs.find(d => d.credentialGroup)?.credentialGroup;
  const certificateTopic = !!credentialGroup || docs.some(d => d.credential);
  // Actions come only from approved metadata; the model cannot supply URLs or tools.
  const actions = certificateTopic ? [{ type: "credentials", label: credentialGroup?.filter ? `Browse ${credentialGroup.filter} credentials` : "Browse all 45 credentials", query: credentialGroup?.filter ?? "" }] : [];
  const suggestions = followUpSuggestions(question, docs);
  try {
    const result = await generateGroundedReply(question, docs, history, req.signal);
    const used = result.mode === "llm" ? result.cited.map(index => ({ ...citationsFor([docs[index - 1]])[0], index })) : [];
    const note = result.mode === "guarded" ? "The generated draft did not pass answer checks and was withheld." : result.mode === "offline" ? "The model did not return an answer. Please try again." : undefined;
    return NextResponse.json({ answer: result.text, citations: used, mode: result.mode, provider: result.provider, model: result.model, generationMs: result.generationMs, retrieval: { strategy, sourceCount: docs.length }, memory: memoryFor(docs), actions: result.mode === "llm" && used.length ? actions : [], note, suggestions }, { headers });
  } catch {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    return NextResponse.json({ error: "The answer timed out. Please try again." }, { status: 503, headers });
  }
}
