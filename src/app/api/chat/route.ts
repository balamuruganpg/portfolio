import { NextResponse } from "next/server";
import { buildSiteDocs } from "@/lib/corpus";
import { ASSISTANT_SYSTEM, sanitizeHistory, validateGroundedAnswer } from "@/lib/agent";
import { generateAnswer, providerStatus } from "@/lib/providers";
import { citationsFor, extractiveAnswer } from "@/lib/retrieve";
import { evidenceDocs, retrieveEvidence } from "@/lib/rag/search";
import { isBlockedQuestion } from "@/lib/rag/core";
import { knowledgeStatus, loadRagEvidence } from "@/lib/rag/server";

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
  if (length > 24_000) return NextResponse.json({ error: "Message is too large." }, { status: 413, headers });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim().slice(0, 100) || "local";
  const wait = retryAfter(ip);
  if (wait) return NextResponse.json({ error: `Please wait ${wait} seconds before asking again.` }, { status: 429, headers: { ...headers, "Retry-After": String(wait) } });
  let body;
  try {
    const raw = await req.text();
    if (raw.length > 24_000) return NextResponse.json({ error: "Message is too large." }, { status: 413, headers });
    body = JSON.parse(raw);
  } catch { return NextResponse.json({ error: "Send a valid JSON question." }, { status: 400, headers }); }
  if (!body || typeof body !== "object" || typeof body.question !== "string" || !body.question.trim()) return NextResponse.json({ error: "Please enter a question." }, { status: 400, headers });
  const question = body.question.trim();
  if (question.length > 600) return NextResponse.json({ error: "Keep your question under 600 characters." }, { status: 400, headers });

  const approved = buildSiteDocs();
  const evidence = await loadRagEvidence();
  const corpus = [...approved, ...evidenceDocs(evidence.chunks, approved)];
  const history = sanitizeHistory(body.history, corpus);
  if (isBlockedQuestion(question)) return NextResponse.json({ answer: "I can help with documented portfolio facts, but cannot reveal private configuration, follow override instructions or fetch visitor-supplied URLs.", citations: [], mode: "refused" }, { headers });
  if (/linkedin/i.test(question) && !evidence.sources.some(s => s.kind === "linkedin" && s.status === "indexed")) {
    const contact = approved.find(d => d.id === "contact")!;
    return NextResponse.json({ answer: "Balamurugan’s LinkedIn profile is https://www.linkedin.com/in/balamuruganpg. Its profile content is not indexed because LinkedIn blocked public access. I can answer from his approved portfolio and resume instead. [1]", citations: [{ ...citationsFor([contact])[0], index: 1 }], mode: "source-unavailable", suggestions: ["What are his skills?", "What are his achievements?"] }, { headers });
  }
  if (/^(hi|hello|hey|good (morning|evening|afternoon))[!.\s]*$/i.test(question)) return NextResponse.json({ answer: "Hi! I can help you explore Balamurugan's projects, verified results and experience. What would you like to know?", citations: [], mode: "greeting", suggestions: ["What is VeraScan?", "What are his achievements?", "Is he open to roles?"] }, { headers });
  const result = retrieveEvidence(question, approved, evidence.chunks, history);
  if (!result.docs.length) return NextResponse.json({ answer: REFUSAL, citations: [], mode: "refused", suggestions: ["What is VeraScan?", "Which projects are live?"] }, { headers });
  const docs = result.docs;
  const citations = citationsFor(docs);
  const context = docs.map((d, i) => `[${i + 1}] ${d.provenance ? "SUPPLEMENTARY SNAPSHOT" : "APPROVED PORTFOLIO FACTS"}: ${d.title}\n${d.text}`).join("\n\n");
  const project = docs.find(d => d.project)?.project;
  const suggestions = project ? [`How does ${project.name} work?`, `What are the limitations of ${project.name}?`, "Which projects are live?"] : ["What are his achievements?", "What is VeraScan?", "How can I contact him?"];
  const fallback = (mode: "offline" | "guarded", note: string) => NextResponse.json({ answer: extractiveAnswer(docs), citations, mode, note, suggestions }, { headers });
  try {
    const generated = await generateAnswer(ASSISTANT_SYSTEM, `SOURCE DOCUMENTS:\n${context}\n\nQUESTION: ${question}`, history, undefined, req.signal);
    const validation = validateGroundedAnswer(generated.text, docs, question);
    if (!validation.valid) return fallback("guarded", "I couldn't verify the generated answer, so here are the original portfolio facts.");
    // Keep all markers aligned with their original source numbers.
    const used = validation.cited.map(index => ({ ...citationsFor([docs[index - 1]])[0], index }));
    return NextResponse.json({ answer: generated.text, citations: used, mode: "llm", provider: generated.provider, suggestions }, { headers });
  } catch {
    if (req.signal.aborted) return new Response(null, { status: 499 });
    return fallback("offline", "The language model is unavailable. These are the original facts from this portfolio, with sources.");
  }
}
